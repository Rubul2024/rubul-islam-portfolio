"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { cn } from "@/lib/utils";

/** Filterable project grid for /projects. */
export default function ProjectGrid({ projects, categories }) {
  const [active, setActive] = useState("All");

  const available = useMemo(
    () => categories.filter((c) => c === "All" || projects.some((p) => p.category === c)),
    [categories, projects],
  );
  const visible = active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <div>
      <div role="group" aria-label="Filter projects by category" className="flex flex-wrap gap-2">
        {available.map((cat) => {
          const count = cat === "All" ? projects.length : projects.filter((p) => p.category === cat).length;
          const selected = active === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              aria-pressed={selected}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition-colors",
                selected
                  ? "border-accent-text/40 bg-accent-soft text-fg"
                  : "border-line text-muted hover:border-line-strong hover:text-fg",
              )}
            >
              {cat}
              <span className="font-mono text-[11px] text-subtle">{count}</span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "project" : "projects"}
        {active !== "All" ? ` in ${active}` : ""}.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((project) => (
          <ProjectCard key={project.slug} project={project} headingLevel="h2" />
        ))}
      </div>
    </div>
  );
}
