# AlignResume 🎯

> **JD-to-resume tailoring engine** — paste a resume and job description, get an AI-powered match score, truthfully rewritten bullets, surfaced skill gaps, and exportable proof PDFs.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-align--resume--beta.vercel.app-brightgreen?style=flat-square)](https://align-resume-beta.vercel.app)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)

[![Groq](https://img.shields.io/badge/LLM-Groq%20%7C%20LLaMA%203.3%2070B-orange?style=flat-square)](https://console.groq.com/)

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## What it does

Most resume tools either rewrite your resume with hallucinated achievements or give generic tips. AlignResume does neither.

It reads your resume and a job description together, scores how well they align, rewrites your bullet points to match the JD **using only what you actually did**, and surfaces the gaps you need to address — honestly.

```
Resume + Job Description → Match Score → Rewritten Bullets → Gap Report → Export PDF
```

---

## Features

| Feature | Description |
|---|---|
| **Match Scoring** | Explainable score showing how well your resume aligns with the JD |
| **Truthful Bullet Rewriting** | AI rewrites bullets using your real experience — never fabricates |
| **Skill & Keyword Gap Analysis** | Surfaces missing skills and ATS keywords from the JD |
| **Side-by-Side Comparison** | Original vs. tailored resume in a structured review flow |
| **Guardrail Enforcement** | Blocks export if risky/unverified content detected |
| **PDF Export** | Playwright-generated PDFs — tailored resume + side-by-side comparison |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 + TypeScript (strict) |
| Styling | Tailwind CSS + Shadcn UI |
| LLM | Groq API — `llama-3.3-70b-versatile` |
| AI Pipeline | Structured JSON prompt orchestration with Zod validation |
| Guardrails | Automated truthfulness checks (metrics, employers, skills) |
| PDF Engine | Playwright (headless Chromium) HTML → PDF |
| Deployment | Vercel via GitHub auto-deploy |
| Testing | Vitest (schema + guardrail tests) |

---

## Prerequisites

- **Node.js 20+ LTS** — install from [nodejs.org](https://nodejs.org/)
- A free **Groq API key** from [console.groq.com](https://console.groq.com/)

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/sdn9300/align-resume.git
cd align-resume

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

Add your Groq key to `.env.local`:

```bash
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

```bash
# 4. Start the dev server
npm run dev
```

Open **http://localhost:3000** (not https).

> ⚠️ Never commit `.env.local` or expose `GROQ_API_KEY` to the browser. It is already in `.gitignore`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run test` | Vitest tests |

---

## Project Structure

```
align-resume/
├── app/
│   ├── page.tsx                    # Landing page with CTA
│   ├── tailor/page.tsx             # Resume + JD input → triggers pipeline
│   ├── tailor/results/[runId]/     # Match scores, gaps, side-by-side diff
│   ├── tailor/review/[runId]/     # Per-bullet accept/confirm/edits
│   ├── tailor/export/[runId]/     # Download PDFs or print preview
│   ├── export/[runId]/             # Print-optimized comparison layout
│   ├── export/[runId]/resume/      # Print-optimized tailored resume
│   └── api/runs/                   # POST → run pipeline, GET/PATCH runs
├── components/                     # Shadcn UI + custom components
├── lib/                            # Pipeline logic, prompts, guardrails
├── prompts/                        # LLM prompt templates (system + per-engine)
├── proxy.ts                        # Rate limiter (10 runs/hour per IP)
├── tests/                          # Vitest suite
├── project_docs/                   # Architecture & implementation docs
└── .env.example
```

---

## How the AI Pipeline Works

```
User Input (Resume + JD)
        ↓
Structured Prompt → Groq API (LLaMA 3.3 70B)
        ↓
JSON Response parsed into:
  ├── Match score + explanation
  ├── Rewritten bullets (grounded in original resume)
  ├── Missing skills / keyword gaps
  └── Side-by-side diff
        ↓
Guardrail check (truthfulness validation)
        ↓
Review UI → User confirms changes → PDF Export
```

Prompts are engineered to return strict JSON — no free-form prose — making the pipeline deterministic, parseable, and easy to extend.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `'npm' is not recognized` | Install Node.js LTS and restart your terminal |
| `localhost` cannot be reached | Run `npm install` then `npm run dev`; check terminal for errors |
| Port 3000 already in use | Run `npm run dev -- -p 3001` and open http://localhost:3001 |
| Empty `node_modules` | Run `npm install` in the project root |
| Groq API errors | Check your key is correct in `.env.local` and has quota remaining |

---

## Roadmap

- [ ] Multi-format resume upload (PDF / DOCX parsing)
- [ ] Version history — track tailored resumes across applications
- [ ] Cover letter generation aligned to the same JD
- [ ] ATS keyword density scoring

---

## Author

**Soumyadeep Nath**

Executive PG Programme — Data Science & AI, IIT Roorkee

[![LinkedIn](https://img.shields.io/badge/LinkedIn-soumyadeep--nath-blue?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/soumyadeep-nath-941780250)

[![GitHub](https://img.shields.io/badge/GitHub-sdn9300-black?style=flat-square&logo=github)](https://github.com/sdn9300)

---

> *Built to solve a real problem — not to pad a portfolio.*
