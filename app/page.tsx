import Link from "next/link";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAF8F5] text-[#1E1E1E] selection:bg-[#E6DFD3]">
      {/* Decorative radial glow */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-[#CBB06D]/15 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-gradient-to-tl from-[#A37F33]/10 to-transparent blur-3xl" />

      <Header />

      <main id="main-content" className="relative z-10 mx-auto max-w-4xl px-4 pb-24 pt-12 text-center">
        <div className="space-y-6">
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.15] tracking-tight text-[#111111] sm:text-6xl">
            Truthful resume tailoring <br />
            <span className="bg-gradient-to-r from-[#A37F33] to-[#CBB06D] bg-clip-text text-transparent">
              for every job description
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-balance text-lg leading-relaxed text-[#6B6560]">
            Paste your resume and a real job listing to see match scores, gap analysis, bullet-level
            rewrites, and a side-by-side comparison — without inventing experience.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="h-12 rounded-full bg-gradient-to-r from-[#A37F33] to-[#CBB06D] px-8 text-base text-white shadow-lg shadow-[#A37F33]/25 hover:shadow-xl hover:shadow-[#A37F33]/30">
            <Link href="/tailor">Start tailoring</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 rounded-full border-[#CBB06D]/40 px-8 text-base text-[#4A3E3D] hover:bg-[#CBB06D]/10 hover:text-[#4A3E3D]">
            <Link href="/tailor?demo=1">Try with sample data</Link>
          </Button>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group relative overflow-hidden rounded-xl border border-[#E6DFD3] bg-white/70 p-5 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#A37F33]/10">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#CBB06D]/20 to-[#A37F33]/20 text-[#A37F33]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <h3 className="mb-1 font-semibold text-[#1E1E1E]">Match scores</h3>
            <p className="text-sm leading-relaxed text-[#6B6560]">Explainable match scores before and after tailoring</p>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-[#E6DFD3] bg-white/70 p-5 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#A37F33]/10">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#CBB06D]/20 to-[#A37F33]/20 text-[#A37F33]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            </div>
            <h3 className="mb-1 font-semibold text-[#1E1E1E]">Gap analysis</h3>
            <p className="text-sm leading-relaxed text-[#6B6560]">Honest suggested actions for missing skills</p>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-[#E6DFD3] bg-white/70 p-5 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#A37F33]/10">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#CBB06D]/20 to-[#A37F33]/20 text-[#A37F33]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="12" x2="12" y1="8" y2="16"/><line x1="8" x2="16" y1="12" y2="12"/></svg>
            </div>
            <h3 className="mb-1 font-semibold text-[#1E1E1E]">Bullet review</h3>
            <p className="text-sm leading-relaxed text-[#6B6560]">Side-by-side comparison with metadata</p>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-[#E6DFD3] bg-white/70 p-5 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#A37F33]/10">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#CBB06D]/20 to-[#A37F33]/20 text-[#A37F33]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            </div>
            <h3 className="mb-1 font-semibold text-[#1E1E1E]">PDF export</h3>
            <p className="text-sm leading-relaxed text-[#6B6560]">Print-ready layout + downloadable PDFs</p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-[#E6DFD3]/60 py-6 text-center text-xs text-[#6B6560]">
        <p>AlignResume — Built with Next.js, Groq LLM, and Playwright</p>
      </footer>
    </div>
  );
}
