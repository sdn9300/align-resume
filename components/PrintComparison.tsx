import { CheckCircle2 } from "lucide-react";

import { GapAnalysis } from "@/components/GapAnalysis";
import { JDSummary } from "@/components/JDSummary";
import { ScoreCard } from "@/components/ScoreCard";
import type { TailoredBullet, TailoringRun } from "@/lib/schemas";

type PrintComparisonProps = {
  run: TailoringRun;
};

function ChangedBullet({ bullet }: { bullet: TailoredBullet }) {
  const isChanged = bullet.original !== bullet.tailored;
  if (!isChanged) return <li className="text-sm leading-relaxed">{bullet.tailored}</li>;

  return (
    <li className="rounded bg-amber-50 p-2 text-sm leading-relaxed print:bg-amber-50">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <span>{bullet.tailored}</span>
      </div>
      <p className="mt-1 text-xs text-neutral-600">
        <span className="font-medium">Change:</span> {bullet.changeReason}
      </p>
    </li>
  );
}

function AppendixTable({ bullets }: { bullets: TailoredBullet[] }) {
  const changed = bullets.filter((b) => b.original !== b.tailored);
  if (changed.length === 0) return null;

  return (
    <section className="print:break-inside-avoid">
      <h2 className="mb-3 text-lg font-semibold">Appendix: rewrite details</h2>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-300 text-left">
            <th className="pb-2 pr-4 font-medium text-neutral-600">Original</th>
            <th className="pb-2 pr-4 font-medium text-neutral-600">Tailored</th>
            <th className="pb-2 pr-4 font-medium text-neutral-600">Reason</th>
            <th className="pb-2 pr-4 font-medium text-neutral-600">Keywords</th>
            <th className="pb-2 font-medium text-neutral-600">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {changed.map((b, i) => (
            <tr key={i} className="border-b border-neutral-200">
              <td className="py-2 pr-4 text-neutral-600">{b.original}</td>
              <td className="py-2 pr-4">{b.tailored}</td>
              <td className="py-2 pr-4 text-neutral-700">{b.changeReason}</td>
              <td className="py-2 pr-4 text-neutral-700">{b.keywordsAddressed.join(", ")}</td>
              <td className="py-2">
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                    b.confidence === "high"
                      ? "bg-emerald-100 text-emerald-800"
                      : b.confidence === "medium"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {b.confidence}
                </span>
                {b.riskFlag && (
                  <span className="mt-1 block text-xs text-red-600">{b.riskFlag}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function PrintComparison({ run }: PrintComparisonProps) {
  const tailored = run.tailoredResume;
  const gaps = run.gaps ?? [];

  const allBullets = tailored?.tailoredExperience.flatMap((e) => e.bullets) ?? [];
  const changedCount = allBullets.filter((b) => b.original !== b.tailored).length;

  return (
    <div className="mx-auto max-w-5xl space-y-8 bg-white p-8 text-black print:p-6">
      <header className="border-b border-neutral-300 pb-4">
        <p className="text-sm text-neutral-600">AlignResume — Comparison Report</p>
        <h1 className="text-2xl font-semibold">
          {run.jobDescription.jobTitle}
          {run.jobDescription.company ? ` @ ${run.jobDescription.company}` : ""}
        </h1>
        <p className="text-sm text-neutral-600">
          Run ID: {run.id} · Generated {new Date(run.createdAt).toLocaleString()}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 print:grid-cols-2">
        <ScoreCard title="Original match" score={run.originalMatch} variant="original" />
        {run.tailoredMatch && (
          <ScoreCard title="Tailored match" score={run.tailoredMatch} variant="tailored" />
        )}
      </section>

      <section className="print:break-inside-avoid">
        <JDSummary jobDescription={run.jobDescription} />
      </section>

      {tailored && (
        <>
          <section>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-lg font-semibold">Bullet comparison</h2>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                {changedCount} changed
              </span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                {allBullets.length - changedCount} unchanged
              </span>
            </div>

            {tailored.tailoredExperience.map((entry) => (
              <div key={`${entry.company}-${entry.title}`} className="mb-6">
                <h3 className="mb-2 font-semibold">
                  {entry.title} @ {entry.company}
                </h3>
                <ul className="space-y-2">
                  {entry.bullets.map((b, i) => (
                    <ChangedBullet key={i} bullet={b} />
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <AppendixTable bullets={allBullets} />
        </>
      )}

      <section className="print:break-inside-avoid">
        <GapAnalysis gaps={gaps} />
      </section>

      <footer className="border-t border-neutral-300 pt-4 text-xs text-neutral-600">
        Disclaimer: Review all tailored content for accuracy before submitting. This tool does not
        guarantee ATS ranking outcomes and is not a substitute for professional career advice.
      </footer>
    </div>
  );
}
