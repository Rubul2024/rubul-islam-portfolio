import { Check, Star } from "lucide-react";
import Badge from "@/components/ui/Badge";
import ProjectVisual from "@/components/projects/ProjectVisual";
import ProjectLinks from "@/components/projects/ProjectLinks";
import { cn } from "@/lib/utils";

function TechList({ tech, className }) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Technologies used">
      {tech.map((t) => (
        <li key={t} className="rounded-md border border-line bg-bg-2 px-2 py-1 font-mono text-[11px] text-muted">
          {t}
        </li>
      ))}
    </ul>
  );
}

/** Large showcase card used for featured projects. Sized to fit one laptop screen. */
export function FeaturedProjectCard({ project, index = 0, headingLevel: H = "h3" }) {
  const reversed = index % 2 === 1;
  const highlight = Boolean(project.highlight);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-3xl border bg-card transition-colors",
        highlight
          ? "border-accent-text/40 shadow-[0_0_0_1px_var(--accent-soft),0_30px_80px_-40px_var(--accent)]"
          : "border-line hover:border-line-strong",
      )}
    >
      {highlight && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent"
        />
      )}
      <div className={cn("grid lg:grid-cols-[1.1fr_1fr]", reversed && "lg:[&>*:first-child]:order-2")}>
        <div className="flex flex-col p-6 sm:p-8 short:p-7">
          <div className="flex flex-wrap items-center gap-2">
            {highlight && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-strong px-2.5 py-1 font-mono text-[11px] leading-none tracking-wide text-white">
                <Star size={11} aria-hidden="true" className="fill-current" />
                Highlight
              </span>
            )}
            <Badge tone="accent">{project.category}</Badge>
            <Badge>{project.status}</Badge>
          </div>

          {project.businessLabel && (
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-text short:mt-4">
              {project.businessLabel}
            </p>
          )}
          <H
            className={cn(
              "text-2xl font-semibold tracking-tight text-fg sm:text-[1.75rem]",
              project.businessLabel ? "mt-1.5" : "mt-5 short:mt-4",
            )}
          >
            {project.title}
          </H>
          <p className="mt-1 text-[15px] text-subtle">{project.subtitle}</p>
          <p className="mt-4 text-pretty text-[15px] leading-relaxed text-muted">{project.summary}</p>

          {project.stats?.length > 0 && (
            <dl className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line">
              {project.stats.map((s) => (
                <div key={s.label} className="bg-bg-2 px-3 py-2.5">
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="block text-lg font-semibold tracking-tight text-fg sm:text-xl">{s.value}</span>
                    <span aria-hidden="true" className="block font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                      {s.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {project.features.slice(0, 4).map((f) => (
              <li key={f} className="flex gap-2.5 text-sm leading-snug text-fg/90">
                <Check size={16} aria-hidden="true" className="mt-px shrink-0 text-accent-text" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <p className="mt-5 border-l-2 border-accent-text/50 pl-3 text-sm leading-relaxed text-muted">
            <span className="font-medium text-fg">My role: </span>
            {project.contribution}
          </p>

          <TechList tech={project.tech} className="mt-5" />
          <ProjectLinks project={project} className="mt-auto pt-6" />
        </div>

        <div className="relative flex items-center border-t border-line bg-bg-2 p-5 sm:p-8 lg:border-l lg:border-t-0">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_30%,var(--accent-soft),transparent)]"
          />
          <ProjectVisual
            variant={project.visual}
            title={project.title}
            className="relative aspect-[16/11] w-full transition-transform duration-500 group-hover:-translate-y-1"
          />
        </div>
      </div>
    </article>
  );
}

/** Compact card used in the supporting-projects grid and on /projects. */
export function ProjectCard({ project, headingLevel: H = "h3" }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong">
      <div className="border-b border-line bg-bg-2 p-4">
        <ProjectVisual variant={project.visual} title={project.title} className="h-40 short:h-36" />
      </div>
      <div className="flex flex-1 flex-col p-6 lg:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{project.category}</Badge>
          <span className="font-mono text-[11px] text-subtle">{project.status}</span>
        </div>
        {project.businessLabel && (
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-accent-text">{project.businessLabel}</p>
        )}
        <H className={cn("text-lg font-semibold tracking-tight text-fg", project.businessLabel ? "mt-1" : "mt-4")}>
          {project.title}
        </H>
        <p className="text-sm text-subtle">{project.subtitle}</p>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-muted lg:line-clamp-4" title={project.summary}>{project.summary}</p>
        <ul className="mt-4 space-y-1.5" aria-label="Key features">
          {project.features.slice(0, 3).map((f) => (
            <li key={f} className="flex gap-2 text-[13px] text-fg/85">
              <Check size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-accent-text" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-l-2 border-line-strong pl-3 text-[13px] leading-relaxed text-subtle lg:line-clamp-2">
          <span className="font-medium text-muted">My role: </span>
          {project.contribution}
        </p>
        <TechList tech={project.tech} className="mt-5" />
        <ProjectLinks project={project} className="mt-auto pt-6" />
      </div>
    </article>
  );
}
