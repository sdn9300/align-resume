"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { StepIndicator } from "@/components/StepIndicator";

export function TailorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const runIdMatch = pathname.match(/\/tailor\/(?:results|review|export)\/([^/]+)/);
  const runId = runIdMatch?.[1];

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <header className="border-b border-[#E6DFD3]/50 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
              <div className="relative -mr-0.5 mt-0.5 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="A"
                  width={24}
                  height={24}
                  className="drop-shadow-sm"
                />
              </div>
              <span className="text-base font-bold tracking-tight text-[#4A3E3D]">
                lign<span className="font-semibold text-[#5C4E43]">Resume</span>
              </span>
            </Link>
            <Link
              href="/tailor"
              className="rounded-full border border-[#E6DFD3] px-4 py-1.5 text-sm text-[#6B6560] transition-all hover:border-[#CBB06D]/40 hover:text-[#4A3E3D]"
            >
              New analysis
            </Link>
          </div>
          <StepIndicator runId={runId} />
        </div>
      </header>
      <div id="main-content" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
