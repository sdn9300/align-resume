# Resume Shapeshifter — Phase-Wise Edge Cases

> Reference companion to `project_docs/implementation-plan.md`.  
> Use this during implementation and QA to avoid regressions and unblock quickly.

---

## How to Use This File

- Before starting a phase, scan that phase section and tag relevant cases as `must-test`.
- During development, convert cases into unit/integration tests where possible.
- Before phase sign-off, ensure all **Exit Criteria Edge Cases** are verified.
- If a new production bug appears, add it here under the corresponding phase.

---

## Phase 0 — Project Bootstrap (Edge Cases)

### Schema and Type System

- Zod schema accepts incomplete objects accidentally because fields are optional by default.
- Schema rejects valid sample data due to overly strict enums (e.g., seniority values).
- JSON fixtures pass TypeScript compile-time but fail Zod runtime parse.
- Circular type references in schema exports break builds or cause import cycles.
- Date fields allow invalid free-form strings that later break sorting/rendering logic.

### Project Setup / Tooling

- Path aliases work in TS but fail in tests due to missing test runner alias config.
- `.env.example` misses a required key; app crashes at runtime with unclear message.
- Windows path separator issues in scripts (`\\` vs `/`) cause local setup failure.
- ESLint or formatter config conflicts with generated Next.js defaults.
- Test runner starts but cannot discover tests due to wrong include pattern.

### Fixtures and Seed Data

- Fixture JSON drifts from schema versions and silently becomes stale.
- Sample resume/JD files contain smart quotes/unicode causing parsing surprises later.
- Fixture files too small/unrealistic, masking real-world parser complexity.

### Exit Criteria Edge Cases (Must Verify)

- `npm run dev` works on a fresh clone with only `.env.local` created from `.env.example`.
- Schema tests fail clearly with actionable errors when fixtures are invalid.
- Baseline build/test commands run on Windows shell without command edits.

---

## Phase 1 — Static Prototype (Edge Cases)

### Routing and Navigation

- Directly opening `/tailor/results/[runId]` without prior submit causes crash.
- Invalid or stale `runId` in URL shows blank page instead of recoverable state.
- Browser back/forward navigation loses wizard state unexpectedly.
- Route typo or mismatch between links and App Router folders causes 404 loops.

### Input UX

- Empty resume or empty JD still enables Analyze button.
- Extremely long paste (large JD/resume) freezes textarea or causes layout jank.
- Non-English or special characters render incorrectly in preview components.
- “Load sample” overwrites user-typed content without confirmation.
- Trailing whitespace/newlines create false “non-empty” validation pass.

### Session Storage / Mock Run

- `sessionStorage` unavailable (privacy mode) causes unhandled exception.
- JSON parse failure from corrupted storage key crashes results page.
- Mock payload shape diverges from `TailoringRun` schema used by components.
- Duplicate generated run IDs overwrite previous mock run.
- Refresh restores stale run from older schema and breaks UI render.

### Results and Diff UI

- ScoreCard divides by zero or displays NaN for missing subscores.
- Gap cards assume non-empty list and crash on empty arrays.
- Side-by-side diff misaligns bullets when counts differ across columns.
- Metadata panels break layout when `keywordsAddressed` is empty.
- Confidence badge fails for unknown value outside `high|medium|low`.

### Print Preview Placeholder

- Print CSS hides key sections accidentally (scores/disclaimer missing).
- Browser print output clips content due to fixed height containers.
- Dark mode styles leak into print and reduce readability.

### Exit Criteria Edge Cases (Must Verify)

- Manual refresh on results/review/export pages remains stable.
- Empty/error mock states are visible and user can recover.
- Print preview is legible and contains required structural blocks.

---

## Phase 2 — LLM Integration (Edge Cases)

### LLM Client and Structured Output

- LLM returns valid JSON with wrong field names (`overall_score` vs `overallScore`).
- LLM returns markdown fences around JSON and parser fails.
- Retry loop retries on non-retryable errors (auth/permission), wasting tokens.
- Timeout/network failures leave run status stuck in `parsing`/`analyzing`.
- Token usage logging includes prompt text accidentally (PII leak risk).

### Prompting

- Prompt order causes model to prioritize style over truthfulness constraints.
- JD parser classifies all skills as required, inflating score logic.
- Bullet rewriter adds unsupported tools due to aggressive keyword matching.
- Gap analysis suggests adding claims even when `canSafelyAdd` should be false.
- Prompt updates in one file but old cached prompt is still used at runtime.

### Resume/JD Parsing

- Resume section headers are non-standard (“Professional Journey”) and not detected.
- Multi-line bullets merge into one line, losing meaning and metrics context.
- Parsed resume loses company/title pairing when date line format is irregular.
- JD with duplicated requirements inflates weighting unexpectedly.
- Seniority extraction misclassifies “Senior” from unrelated context (“senior stakeholders”).

### Pipeline Orchestration

- Partial stage failure returns 500 and loses already computed artifacts.
- Concurrent submissions from same client overwrite in-memory run data.
- Stage status transitions are skipped, confusing progress UI.
- Capped bullet rewrite truncates crucial experience section without warning.
- Tailored profile conversion for rescoring drops sections and biases score.

### API Boundaries

- Route accepts malformed body and fails deep in pipeline instead of early validation.
- `GET /api/runs/[id]` leaks internal errors in raw stack traces.
- Error codes inconsistent across routes, making client handling brittle.
- Missing run ID returns generic 500 instead of 404-like typed error.

### File Upload (if included in this phase)

- MIME spoofing allows non-PDF/DOCX upload.
- File over size limit consumes memory before rejection.
- PDF extraction returns empty text for scanned image PDF (OCR absent).
- DOCX parser fails on embedded tables/headers and crashes run.

### Exit Criteria Edge Cases (Must Verify)

- Invalid LLM JSON triggers exactly one retry and then returns clean error object.
- Pipeline sets `failed` with stage details and does not crash the app shell.
- Manual truthfulness spot-check on 3 varied JDs finds no fabricated employers/degrees.

---

## Phase 3 — PDF Export (Edge Cases)

### Print Routes and Data Hydration

- Export route loads before run is available and renders empty template.
- Run not found path shows blank page instead of explicit not-found UI.
- Hydration mismatch between server and client causes missing bullet highlights.

### Layout and Rendering

- Long bullets overflow columns or overlap across pages.
- Page breaks split bullet/reason pairs in confusing ways.
- Header repeats inconsistently across pages.
- Fonts unavailable in deployment environment cause layout shift.
- Special characters (em dash, accents) render as tofu boxes in PDF.

### Comparison Accuracy

- “Changed” highlighter marks unchanged bullets due to whitespace-only differences.
- Bullet mapping compares by index and mismatches when order changes.
- Confidence/keyword appendix omits some changed bullets.
- Score strip shows stale values from prior run because of caching.

### PDF Engine/Infra

- Playwright works locally but fails in serverless runtime (missing binaries).
- PDF generation exceeds memory/time limits on large resumes.
- Concurrent export requests generate corrupted or mixed file streams.
- Browser context leak in Playwright degrades performance over multiple exports.

### Security and Output Hygiene

- PDF accidentally includes hidden debug text or internal IDs not intended for users.
- Export endpoint returns raw stack trace on renderer failure.
- Generated files cached publicly when they should be private/ephemeral.

### Exit Criteria Edge Cases (Must Verify)

- Both PDFs open correctly on common viewers (Chrome, Edge, Acrobat).
- Export duration remains acceptable on large but valid sample inputs.
- Comparison PDF always includes disclaimer and gap summary.

---

## Phase 4 — Guardrails & User Review (Edge Cases)

### Guardrail Logic

- Rule engine flags true positives too aggressively and blocks legitimate rewrites.
- Rule precedence conflict: one rule strips content while another still references it.
- Employer detection misses abbreviations/aliases and raises false “new employer”.
- Metric detector misses rewritten numerals (“forty percent” vs `40%`).
- Seniority inflation checker mistakes role context (e.g., “senior stakeholder support”).

### Integration in Pipeline

- Guardrail warnings not persisted, so review UI cannot display risk context.
- Blocking violations still allow `status: complete` due to incorrect branch handling.
- Re-run after user edits does not clear previously resolved flags.

### Review UI Behavior

- User edits a bullet, but `userConfirmed` resets unexpectedly on refresh.
- Revert action restores wrong source bullet due to stale list indexing.
- Color-only risk indicators fail accessibility contrast and meaning.
- Export button state not synced with latest confirmation data.

### Export Gate Enforcement

- Frontend blocks export, but direct API call still allows bypass.
- Disclaimer checkbox state is client-only and not validated server-side.
- Mixed-risk runs (some confirmed, some not) are incorrectly treated as all confirmed.
- Guardrail violation response lacks actionable message for the user.

### Testing

- Adversarial tests cover obvious fakes but miss subtle hallucinations.
- Snapshot tests pass while rule semantics changed (false confidence).

### Exit Criteria Edge Cases (Must Verify)

- Injected fake employer/degree is reliably blocked or stripped.
- High-risk unconfirmed bullets always block export (UI and API both).
- Warning-only cases still permit export with proper disclaimer.

---

## Phase 5 — Polish & Demo (Edge Cases)

### UX and Accessibility

- Skeleton loaders never resolve on failed requests (infinite loading perception).
- Empty states route user to dead ends with no recovery action.
- Mobile layout hides key controls (accept/revert/export).
- Keyboard-only users cannot complete review and export flow.

### Demo and Content Integrity

- Demo fixtures include unrealistic claims and undermine trust messaging.
- “Try demo” seeds stale run ID and fails for new visitors.
- README setup instructions drift from actual scripts/env variables.
- Demo script depends on local-only assumptions not documented.

### Reliability / Ops

- Rate limiter blocks legitimate repeated testing in development environment.
- Idempotency key collisions merge unrelated runs.
- Cleanup job deletes active run before export completes.
- In-memory store reset (server restart) breaks currently open review pages.

### Deployment

- Environment variables set in local but missing in hosted deployment.
- Different Node/runtime version changes PDF behavior.
- CORS/proxy settings break file download headers.
- Build-time static optimization accidentally caches dynamic run pages.

### Observability and Privacy

- Logs accidentally include resume/JD raw text in error contexts.
- Missing correlation IDs make debugging impossible for multi-step failures.
- Alerting noise from known transient LLM errors hides real incidents.

### Exit Criteria Edge Cases (Must Verify)

- A new user can follow README and produce both PDFs without manual fixes.
- Demo run remains truthful and reproducible across at least two environments.
- Final E2E run validates all architecture definition-of-done points.

---

## Cross-Phase Edge Cases

### State and Consistency

- Schema evolution between phases breaks old stored runs.
- One phase updates field names without migrating downstream consumers.
- Frontend and API validate different schema versions.

### Performance and Cost

- Prompt/token growth increases latency and cost unexpectedly.
- Repeated retries or duplicate submissions multiply LLM usage.
- Large diff rendering slows browser and impacts UX.

### Security and Compliance

- Secrets leak via client bundle, logs, error pages, or PDF text.
- Temporary file retention exceeds intended 24h policy.
- Third-party dependencies introduce vulnerable transitive packages.

---

## Suggested Test Mapping (Quick Reference)

- `tests/schemas.test.ts`: schema strictness, enum drift, fixture compatibility.
- `tests/pipeline.test.ts`: status transitions, partial failure, retry behavior.
- `tests/parsers.test.ts`: non-standard section names, malformed JD text.
- `tests/guardrails.test.ts`: fabricated employer/degree/metric/seniority cases.
- `tests/pdf.test.ts`: required sections present, file generation sanity checks.
- `tests/e2e/demo.spec.ts`: full user journey from input to export.

---

*Document version: 1.0 — generated from `project_docs/implementation-plan.md`*
