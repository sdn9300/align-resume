import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <main id="main-content" className="relative mx-auto flex min-h-[calc(100dvh-5rem)] max-w-5xl flex-col items-center justify-center gap-12 px-6 py-20">
        <div className="space-y-6 text-center">
          <div className="mb-2 inline-flex items-center gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 px-5 py-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground shadow-sm shadow-primary/20">
              A
            </span>
            <span className="text-sm font-semibold tracking-wide text-primary">
              AlignResume
            </span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              Truthful resume tailoring
            </span>
            <br />
            <span className="text-primary">for every job description</span>
          </h1>
          <p className="mx-auto max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
            Paste your resume and a real job listing to see match scores, gap analysis, bullet-level
            rewrites, and a side-by-side comparison — without inventing experience.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="h-12 rounded-full px-8 text-base shadow-lg shadow-primary/20">
            <Link href="/tailor">Start tailoring</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-8 text-base">
            <Link href="/tailor?demo=1">Try with sample data</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-white/60 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-900/5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <h3 className="mb-1.5 font-semibold">Match scores</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">Explainable match scores before and after tailoring</p>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-white/60 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-900/5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            </div>
            <h3 className="mb-1.5 font-semibold">Gap analysis</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">Honest suggested actions for missing skills</p>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-white/60 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-900/5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="12" x2="12" y1="8" y2="16"/><line x1="8" x2="16" y1="12" y2="12"/></svg>
            </div>
            <h3 className="mb-1.5 font-semibold">Bullet review</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">Side-by-side comparison with metadata</p>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-white/60 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-900/5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            </div>
            <h3 className="mb-1.5 font-semibold">PDF export</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">Print-ready layout + downloadable PDFs</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <p>AlignResume — Built with Next.js, Groq LLM, and Playwright</p>
      </footer>
    </>
  );
}
