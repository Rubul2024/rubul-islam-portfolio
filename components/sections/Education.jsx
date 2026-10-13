import { GraduationCap, Award } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { education, certifications } from "@/data/education";

function Item({ icon: Icon, title, org, period, detail }) {
  return (
    <article className="flex h-full gap-4 rounded-2xl border border-line bg-card p-5 transition-colors hover:border-line-strong">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-bg-2 text-accent-text">
        <Icon size={19} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[11px] text-subtle">{period}</p>
        <h4 className="mt-1 text-[15px] font-semibold leading-snug text-fg">{title}</h4>
        <p className="mt-0.5 text-sm text-muted">{org}</p>
        {detail && <p className="mt-2 text-[13px] leading-relaxed text-subtle">{detail}</p>}
      </div>
    </article>
  );
}

export default function Education() {
  return (
    <section id="education" aria-labelledby="education-title" className="section-y border-t border-line">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            id="education-title"
            index="06"
            eyebrow="Education & certifications"
            title="A computer applications foundation, kept current."
          />
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-2 short:mt-8">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-subtle">Education</h3>
            <ul className="mt-4 grid gap-3">
              {education.map((e, i) => (
                <Reveal as="li" key={e.degree} delay={i * 60}>
                  <Item icon={GraduationCap} title={e.degree} org={e.institution} period={e.period} detail={e.detail} />
                </Reveal>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-subtle">Certifications</h3>
            <ul className="mt-4 grid gap-3">
              {certifications.map((c, i) => (
                <Reveal as="li" key={c.title} delay={i * 60}>
                  <Item icon={Award} title={c.title} org={c.issuer} period={c.period} detail={c.detail} />
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
