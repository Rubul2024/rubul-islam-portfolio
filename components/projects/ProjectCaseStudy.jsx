import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import ProjectVisual from "@/components/projects/ProjectVisual";
import ProjectLinks from "@/components/projects/ProjectLinks";

function Block({ index, title, children }) {
  return (
    <Reveal as="section" className="border-t border-line pt-10" aria-labelledby={`cs-${index}`}>
      <p className="font-mono text-xs text-accent-text">{String(index).padStart(2, "0")}</p>
      <h2 id={`cs-${index}`} className="mt-2 text-2xl font-semibold tracking-tight text-fg">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </Reveal>
  );
}

function ArchitectureDiagram({ layers }) {
  return (
    <figure>
      <ol className="space-y-0" aria-label="Architecture layers, from the user interface down to data">
        {layers.map((layer, i) => (
          <li key={layer.layer}>
            {i > 0 && (
              <div aria-hidden="true" className="ml-8 flex h-8 items-center">
                <span className="h-full w-px bg-line-strong" />
                <span className="ml-3 font-mono text-[10px] text-subtle">↓</span>
              </div>
            )}
            <div className="grid gap-3 rounded-xl border border-line bg-card p-4 sm:grid-cols-[9rem_1fr] sm:items-center sm:gap-5">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">{layer.layer}</p>
                <p className="mt-0.5 font-mono text-sm text-accent-text">{layer.tech}</p>
              </div>
              <p className="text-sm leading-relaxed text-muted">{layer.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <figcaption className="mt-3 font-mono text-[11px] text-subtle">
        Diagram: high-level structure of the application.
      </figcaption>
    </figure>
  );
}

export default function ProjectCaseStudy({ project, next }) {
  const cs = project.caseStudy;
  const blocks = [
    { title: "Overview", body: <p className="text-pretty text-[17px] leading-relaxed text-muted">{cs.overview}</p> },
    { title: "The need", body: <p className="text-pretty text-[17px] leading-relaxed text-muted">{cs.problem}</p> },
    { title: "My role", body: <p className="text-pretty text-[17px] leading-relaxed text-muted">{cs.role}</p> },
    { title: "Architecture", body: <ArchitectureDiagram layers={cs.architecture} /> },
    {
      title: "Engineering decisions",
      body: (
        <ul className="grid gap-3">
          {cs.decisions.map((d) => (
            <li key={d.title} className="rounded-xl border border-line bg-card p-5">
              <h3 className="text-[15px] font-semibold text-fg">{d.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{d.detail}</p>
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: "Key features",
      body: (
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {project.features.map((f) => (
            <li key={f} className="flex gap-2.5 text-[15px] text-fg/90">
              <Check size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-accent-text" />
              {f}
            </li>
          ))}
        </ul>
      ),
    },
  ];

  // Only rendered once real challenges are added in data/projects.js
  if (cs.challenges?.length) {
    blocks.push({
      title: "Challenges & solutions",
      body: (
        <ul className="grid gap-3">
          {cs.challenges.map((c) => (
            <li key={c.challenge} className="rounded-xl border border-line bg-card p-5">
              <h3 className="text-[15px] font-semibold text-fg">{c.challenge}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{c.solution}</p>
            </li>
          ))}
        </ul>
      ),
    });
  }

  return (
    <article>
      <header className="relative isolate overflow-hidden border-b border-line">
        <div aria-hidden="true" className="grid-bg absolute inset-0 -z-10" />
        <div className="container-x pb-14 pt-28 md:pb-20 md:pt-36">
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg">
            <ArrowLeft size={16} aria-hidden="true" />
            All projects
          </Link>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="accent">{project.category}</Badge>
                <Badge>{project.status}</Badge>
              </div>
              <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-subtle">Case study</p>
              <h1 className="mt-2 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-fg sm:text-5xl md:text-6xl">
                {project.title}
              </h1>
              <p className="mt-3 text-lg text-muted">{project.subtitle}</p>
              <p className="mt-6 max-w-xl text-pretty leading-relaxed text-muted">{project.summary}</p>
              <ProjectLinks project={project} showCaseStudy={false} className="mt-8" />
            </div>
            <ProjectVisual variant={project.visual} title={project.title} className="aspect-[16/11] w-full" />
          </div>
        </div>
      </header>

      <div className="container-x grid gap-12 py-16 md:py-20 lg:grid-cols-[16rem_1fr] lg:gap-16">
        <aside className="lg:sticky lg:top-28 lg:self-start" aria-label="Project summary">
          <dl className="space-y-6 rounded-2xl border border-line bg-bg-2 p-6">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">Role</dt>
              <dd className="mt-1.5 text-sm text-fg">{cs.role.split("—")[0].trim()}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">Type</dt>
              <dd className="mt-1.5 text-sm text-fg">{project.status}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">Stack</dt>
              <dd className="mt-2">
                <ul className="flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <li key={t} className="rounded-md border border-line bg-card px-2 py-1 font-mono text-[11px] text-muted">
                      {t}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </aside>

        <div className="min-w-0 space-y-14">
          {blocks.map((b, i) => (
            <Block key={b.title} index={i + 1} title={b.title}>
              {b.body}
            </Block>
          ))}
          <p className="border-t border-line pt-6 font-mono text-[11px] leading-relaxed text-subtle">
            Visuals on this page are illustrative mockups and diagrams, not screenshots of the live application.
          </p>
        </div>
      </div>

      <footer className="border-t border-line bg-bg-2">
        <div className="container-x flex flex-col gap-8 py-14 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-subtle">Have a similar project?</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-fg">Let&apos;s talk about what you&apos;re building.</p>
            <Button href="/#contact" className="mt-5">
              Start a conversation
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </div>
          {next && (
            <Link
              href={`/projects/${next.slug}`}
              className="group rounded-2xl border border-line bg-card p-6 transition-colors hover:border-line-strong md:w-80"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">Next case study</p>
              <p className="mt-2 flex items-center justify-between gap-3 text-lg font-semibold text-fg">
                {next.title}
                <ArrowRight size={18} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
              </p>
              <p className="mt-1 text-sm text-muted">{next.subtitle}</p>
            </Link>
          )}
        </div>
      </footer>
    </article>
  );
}
