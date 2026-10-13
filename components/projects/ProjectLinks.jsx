import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { cn, prettyUrl } from "@/lib/utils";

/**
 * Case study / live / source actions with honest fallbacks when a link
 * does not exist.
 */
export default function ProjectLinks({ project, showCaseStudy = true, className }) {
  const { slug, title, links, caseStudy } = project;
  const fallbacks = [];
  if (!links.live) fallbacks.push(project.status?.toLowerCase().includes("capstone") ? "No public deployment" : "No public demo");
  if (!links.repo) fallbacks.push("Source not public");

  return (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-3", className)}>
      {showCaseStudy &&
        (caseStudy ? (
          <Link
            href={`/projects/${slug}`}
            className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-fg"
            aria-label={`View case study: ${title}`}
          >
            <span className="underline decoration-line-strong underline-offset-4 transition-colors group-hover/link:decoration-accent">
              View Case Study
            </span>
            <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover/link:translate-x-0.5" />
          </Link>
        ) : (
          <span className="text-sm text-subtle">Case study in progress</span>
        ))}

      {links.live && (
        <a
          href={links.live}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
        >
          {prettyUrl(links.live)}
          <ArrowUpRight
            size={15}
            aria-hidden="true"
            className="transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
          />
          <span className="sr-only">(live site for {title}, opens in a new tab)</span>
        </a>
      )}

      {links.repo && (
        <a
          href={links.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
        >
          <GithubIcon size={15} />
          Source
          <span className="sr-only">(GitHub repository for {title}, opens in a new tab)</span>
        </a>
      )}

      {fallbacks.length > 0 && <span className="font-mono text-[11px] text-subtle">{fallbacks.join(" · ")}</span>}
    </div>
  );
}
