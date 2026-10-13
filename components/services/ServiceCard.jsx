import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Clock } from "lucide-react";
import ServiceIcon from "@/components/services/ServiceIcon";
import { SHOW_PRICES } from "@/data/services";
import { projects } from "@/data/projects";
import { cn, prettyUrl } from "@/lib/utils";

/** Contact link that preselects this service in the form. */
export function consultHref(service) {
  return `/?service=${service.slug}#contact`;
}

/**
 * Best "see related work" link for a service: a case-study page if one exists,
 * otherwise the live site.
 */
export function relatedWork(service) {
  const related = service.relatedProjects.map((slug) => projects.find((p) => p.slug === slug)).filter(Boolean);
  const withCaseStudy = related.find((p) => p.caseStudy);
  if (withCaseStudy) return { href: `/projects/${withCaseStudy.slug}`, label: withCaseStudy.title, external: false };
  const live = related.find((p) => p.links?.live);
  if (live) return { href: live.links.live, label: prettyUrl(live.links.live), external: true };
  return null;
}

function Price({ service, className }) {
  if (!SHOW_PRICES) return null;
  return (
    <p className={cn("text-sm text-muted", className)}>
      Starting from <span className="font-semibold text-fg">{service.startingFrom}</span>
      {service.priceNote && <span className="text-subtle"> {service.priceNote}</span>}
    </p>
  );
}

/** Full card for /services. */
export function ServiceCard({ service }) {
  const work = relatedWork(service);
  return (
    <article
      id={service.slug}
      className="group flex h-full scroll-mt-28 flex-col rounded-3xl border border-line bg-card p-6 transition-colors hover:border-line-strong sm:p-8"
    >
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-text">
          <ServiceIcon name={service.icon} size={22} />
        </span>
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-fg">{service.title}</h3>
          <p className="mt-1 text-sm text-subtle">{service.forWho}</p>
        </div>
      </div>

      <p className="mt-5 text-pretty text-lg font-medium leading-snug text-fg">{service.outcome}</p>
      <p className="mt-2 text-pretty text-sm leading-relaxed text-muted">{service.problem}</p>

      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">What&apos;s included</p>
      <ul className="mt-3 grid gap-2">
        {service.includes.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-snug text-fg/90">
            <Check size={16} aria-hidden="true" className="mt-px shrink-0 text-accent-text" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-5">
        <p className="inline-flex items-center gap-1.5 text-sm text-muted">
          <Clock size={14} aria-hidden="true" className="text-subtle" />
          <span className="sr-only">Typical timeline: </span>
          {service.timeline}
        </p>
        <Price service={service} />
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-6">
        <Link
          href={consultHref(service)}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-accent-strong px-5 text-sm font-medium text-white transition-[filter,transform] hover:brightness-110 active:scale-[0.98]"
        >
          Discuss this project
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        {work &&
          (work.external ? (
            <a
              href={work.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg hover:decoration-accent"
            >
              See related work
              <ArrowUpRight size={14} aria-hidden="true" />
              <span className="sr-only">: {work.label} (opens in a new tab)</span>
            </a>
          ) : (
            <Link
              href={work.href}
              className="inline-flex items-center gap-1 text-sm text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg hover:decoration-accent"
            >
              See related work
              <span className="sr-only">: {work.label} case study</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          ))}
      </div>
    </article>
  );
}

/** Short card for the home-page Services section. */
export function ServiceCardCompact({ service, headingLevel: H = "h3" }) {
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-line bg-card p-5 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong">
      <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent-text">
        <ServiceIcon name={service.icon} size={20} />
      </span>
      <H className="mt-4 text-base font-semibold tracking-tight text-fg">
        <Link href={`/services#${service.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
          {service.title}
        </Link>
      </H>
      <p className="mt-2 text-pretty text-sm leading-relaxed text-muted">{service.outcome}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="inline-flex items-center gap-1.5 text-xs text-subtle">
          <Clock size={13} aria-hidden="true" />
          {service.timeline}
        </span>
        <ArrowUpRight
          size={17}
          aria-hidden="true"
          className="text-subtle transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-text"
        />
      </div>
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl ring-accent-text group-has-[a:focus-visible]:ring-2" />
    </article>
  );
}
