"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Category tabs + a grid of logo tiles. */
export default function SkillsExplorer({ items, categories }) {
  const [active, setActive] = useState("All");
  const tabs = ["All", ...categories];
  const visible = active === "All" ? items : items.filter((i) => i.category === active);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Filter skills by category" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {tabs.map((tab) => {
            const selected = active === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActive(tab)}
                aria-pressed={selected}
                className={cn(
                  "h-10 shrink-0 whitespace-nowrap rounded-full border px-5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] transition-colors",
                  selected
                    ? "border-fg bg-fg text-bg"
                    : "border-line-strong bg-card text-muted hover:border-fg/40 hover:text-fg",
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>
        <p className="shrink-0 self-start rounded-full border border-line-strong px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted sm:self-auto" aria-live="polite">
          {visible.length} · {active === "All" ? "Technologies" : active}
        </p>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 short:mt-5">
        {visible.map((skill) => (
          <li key={skill.name}>
            <div
              className="group flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-card px-3 py-7 text-center lg:px-2 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-[color:var(--brand)] hover:shadow-[0_18px_40px_-24px_var(--brand)] short:py-6"
              style={{ "--brand": skill.style === "mono" ? "var(--fg)" : skill.hex }}
            >
              <span
                className={cn(
                  "grid size-16 place-items-center rounded-full border transition-transform duration-300 group-hover:scale-105",
                  skill.style === "mono" && "border-transparent bg-fg",
                  skill.style === "solid" && "border-white/10",
                )}
                style={
                  skill.style === "solid"
                    ? { backgroundColor: skill.hex }
                    : skill.style === "tint"
                      ? { backgroundColor: `${skill.hex}1f`, borderColor: `${skill.hex}40` }
                      : undefined
                }
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className={cn(
                    skill.large ? "size-11" : "size-8",
                    skill.style === "mono" && "fill-bg",
                    skill.style === "solid" && "fill-white",
                  )}
                  style={skill.style === "tint" ? { fill: skill.hex } : undefined}
                >
                  <path d={skill.path} />
                </svg>
              </span>
              <span>
                <span className="block font-mono text-xs font-semibold uppercase tracking-[0.14em] text-fg lg:text-[11px] lg:tracking-[0.1em] xl:text-xs xl:tracking-[0.14em]">{skill.name}</span>
                <span className="mt-1 block text-[11px] text-subtle">{skill.category}</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
