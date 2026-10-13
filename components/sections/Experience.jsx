import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { experience } from "@/data/experience";
import { cn } from "@/lib/utils";

export default function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="section-y border-t border-line bg-bg-2">
      <div className="container-x grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="experience-title"
            index="05"
            eyebrow="Experience"
            title="Shipping for clients since 2021."
            description="Client website development and maintenance, plus web portal work during my internship."
          />
        </Reveal>

        <ol className="relative">
          {experience.map((job, i) => (
            <Reveal as="li" key={`${job.company}-${job.start}`} delay={i * 80} className="relative pb-6 pl-8 last:pb-0 sm:pl-10">
              {/* timeline rail + node */}
              {i < experience.length - 1 && (
                <span aria-hidden="true" className="absolute bottom-0 left-[5px] top-2 w-px bg-line-strong" />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-0 top-1.5 size-[11px] rounded-full border-2",
                  job.current ? "border-accent bg-accent shadow-[0_0_0_4px_var(--accent-soft)]" : "border-line-strong bg-bg-2",
                )}
              />

              <article className="rounded-2xl border border-line bg-card p-5 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-fg">{job.role}</h3>
                    <p className="text-[15px] text-muted">
                      {job.company} <span className="text-subtle">· {job.location}</span>
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-xs text-subtle">
                    <time>{job.start}</time> – {job.current ? <span className="text-accent-text">{job.end}</span> : <time>{job.end}</time>}
                  </p>
                </div>

                <p className="mt-3 text-pretty text-[15px] leading-relaxed text-fg/90">{job.summary}</p>

                <ul className="mt-3 grid gap-x-6 gap-y-1.5 xl:grid-cols-2">
                  {job.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-[13.5px] leading-relaxed text-muted short:leading-snug">
                      <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-accent-text" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <ul className="mt-4 flex flex-wrap gap-1.5 short:mt-3" aria-label="Technologies">
                  {job.tags.map((t) => (
                    <li key={t} className="rounded-md border border-line bg-bg-2 px-2 py-1 font-mono text-[11px] text-muted">
                      {t}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
