# Resume Shapeshifter

JD-to-resume tailoring engine: parse a resume and job description, score match quality, rewrite bullets truthfully, surface gaps, and export proof PDFs.

## Prerequisites

- **Node.js 20+** (LTS) and **npm** on your PATH  
  Install from [nodejs.org](https://nodejs.org/) if `npm` is not recognized.

## Quick start

```bash
cd "c:\My Projects\Resume Builder Project"
npm install
copy .env.example .env.local
npm run dev
```

Open **http://localhost:3000** (not https). If the page says “cannot be reached”, the dev server is not running — run `npm run dev` first and wait for `Ready`.

### Phase 2 — Groq API key

1. Create a key at [console.groq.com](https://console.groq.com/)
2. Add to `.env.local`:

```bash
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

Never commit `.env.local` or expose `GROQ_API_KEY` to the browser.

## Current status

### Phase 1 (UI + mock pipeline)

- Full flow: `/` → `/tailor` → results → review → export
- Mock `POST /api/runs` (1.5s delay) + `sessionStorage`
- Print layout at `/export/[runId]`

### Phase 2 (next)

- Real LLM pipeline via **Groq** — see `project_docs/implementation-plan.md`

## Scripts

| Command         | Description                |
|-----------------|----------------------------|
| `npm run dev`   | Start dev server (port 3000) |
| `npm run build` | Production build           |
| `npm run lint`  | ESLint                     |
| `npm run test`  | Vitest schema tests        |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `'npm' is not recognized` | Install Node.js LTS and restart your terminal |
| `localhost` cannot be reached | Run `npm install` then `npm run dev`; check terminal for errors |
| Port 3000 in use | Run `npm run dev -- -p 3001` and open http://localhost:3001 |
| Empty `node_modules` | Run `npm install` in the project folder |

## Docs

- `project_docs/architecture.md` — Groq LLM integration (§7, §16)
- `project_docs/implementation-plan.md`
- `project_docs/edge-case.md`
