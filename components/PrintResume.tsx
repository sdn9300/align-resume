import type { TailoringRun } from "@/lib/schemas";

type PrintResumeProps = {
  run: TailoringRun;
};

export function PrintResume({ run }: PrintResumeProps) {
  const resume = run.resume;
  const tailored = run.tailoredResume;

  const contact = resume.contact;
  const summary = tailored?.tailoredSummary ?? resume.summary;
  const skills = tailored?.tailoredSkills ?? resume.skills;

  return (
    <div className="mx-auto max-w-3xl space-y-6 bg-white p-8 text-black print:p-6">
      {/* Header / Contact */}
      <header className="border-b border-neutral-300 pb-4">
        {contact.name && <h1 className="text-2xl font-semibold">{contact.name}</h1>}
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-700">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>{contact.phone}</span>}
          {contact.location && <span>{contact.location}</span>}
          {contact.links?.map((link) => (
            <span key={link}>{link}</span>
          ))}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section>
          <h2 className="mb-2 border-b border-neutral-300 pb-1 text-sm font-semibold uppercase tracking-wider">
            Summary
          </h2>
          <p className="text-sm leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section>
          <h2 className="mb-2 border-b border-neutral-300 pb-1 text-sm font-semibold uppercase tracking-wider">
            Skills
          </h2>
          <p className="text-sm leading-relaxed">{skills.join(" · ")}</p>
        </section>
      )}

      {/* Experience */}
      {tailored?.tailoredExperience && tailored.tailoredExperience.length > 0 && (
        <section>
          <h2 className="mb-3 border-b border-neutral-300 pb-1 text-sm font-semibold uppercase tracking-wider">
            Experience
          </h2>
          <div className="space-y-4">
            {tailored.tailoredExperience.map((entry) => (
              <div key={`${entry.company}-${entry.title}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold">{entry.title}</h3>
                  <span className="text-sm text-neutral-600">
                    {entry.startDate} — {entry.endDate ?? "Present"}
                  </span>
                </div>
                <p className="text-sm text-neutral-700">{entry.company}</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed">
                  {entry.bullets.map((b, i) => (
                    <li key={i}>{b.tailored}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {tailored?.tailoredProjects && tailored.tailoredProjects.length > 0 && (
        <section>
          <h2 className="mb-3 border-b border-neutral-300 pb-1 text-sm font-semibold uppercase tracking-wider">
            Projects
          </h2>
          <div className="space-y-3">
            {tailored.tailoredProjects.map((proj) => (
              <div key={proj.name}>
                <h3 className="font-semibold">{proj.name}</h3>
                {proj.description && (
                  <p className="text-sm text-neutral-700">{proj.description}</p>
                )}
                <ul className="mt-1 list-inside list-disc space-y-1 text-sm leading-relaxed">
                  {proj.bullets.map((b, i) => (
                    <li key={i}>{b.tailored}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <section>
          <h2 className="mb-3 border-b border-neutral-300 pb-1 text-sm font-semibold uppercase tracking-wider">
            Education
          </h2>
          <div className="space-y-2">
            {resume.education.map((edu, i) => (
              <div key={i}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold">{edu.school}</h3>
                  <span className="text-sm text-neutral-600">
                    {edu.startDate} — {edu.endDate}
                  </span>
                </div>
                <p className="text-sm text-neutral-700">
                  {edu.degree}
                  {edu.field ? `, ${edu.field}` : ""}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {resume.certifications.length > 0 && (
        <section>
          <h2 className="mb-3 border-b border-neutral-300 pb-1 text-sm font-semibold uppercase tracking-wider">
            Certifications
          </h2>
          <div className="space-y-1 text-sm">
            {resume.certifications.map((cert, i) => (
              <p key={i}>
                {cert.name}
                {cert.issuer ? ` — ${cert.issuer}` : ""}
                {cert.date ? ` (${cert.date})` : ""}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Footer disclaimer */}
      <footer className="border-t border-neutral-300 pt-4 text-xs text-neutral-600 print:mt-8">
        This resume was tailored using AlignResume. Verify all content for accuracy before
        submitting. No ATS ranking outcome is guaranteed.
      </footer>
    </div>
  );
}
