"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Sticky "On this page" list that highlights the heading in view. */
export default function TableOfContents({ headings }) {
  const [active, setActive] = useState(headings[0]?.id);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const elements = headings.map((h) => document.getElementById(h.id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav aria-label="Table of contents">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">On this page</p>
      <ul className="mt-4 space-y-1 border-l border-line">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l py-1 text-[13px] leading-snug transition-colors",
                h.level === 3 ? "pl-7" : "pl-4",
                active === h.id ? "border-accent text-fg" : "border-transparent text-subtle hover:text-fg",
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
