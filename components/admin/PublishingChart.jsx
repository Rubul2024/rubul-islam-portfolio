"use client";

import { useState } from "react";

/**
 * Posts published per month (last 6 months). Single series, so no legend —
 * the card title names it. Hover/focus a bar for its exact value; a table
 * copy is provided for screen readers.
 */
export default function PublishingChart({ months }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...months.map((m) => m.count));
  const ticks = max <= 4 ? Array.from({ length: max + 1 }, (_, i) => i) : [0, Math.round(max / 2), max];

  return (
    <div>
      <div className="relative h-44 pl-6">
        {/* Recessive gridlines + y-axis labels */}
        {ticks.map((t) => (
          <div
            key={t}
            aria-hidden="true"
            className="absolute inset-x-0 border-t border-line"
            style={{ bottom: `${(t / max) * 100}%` }}
          >
            <span className="absolute -left-0 -translate-y-1/2 font-mono text-[10px] text-subtle">{t}</span>
          </div>
        ))}

        <div className="relative flex h-full items-end gap-2 pl-2" aria-hidden="true">
          {months.map((m, i) => {
            const pct = (m.count / max) * 100;
            const active = hover === i;
            return (
              <div
                key={`${m.label}-${m.year}`}
                className="relative flex h-full flex-1 items-end justify-center"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <div
                  className="w-full max-w-9 rounded-t-[4px] transition-[filter,height] duration-500"
                  style={{
                    height: m.count ? `${pct}%` : "2px",
                    background: m.count ? "var(--accent)" : "var(--line-strong)",
                    filter: active ? "brightness(1.15)" : undefined,
                  }}
                />
                {active && (
                  <div className="pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-lg border border-line-strong bg-bg px-2.5 py-1.5 text-xs text-fg shadow-card">
                    <span className="text-muted">
                      {m.label} {m.year}
                    </span>{" "}
                    <strong className="font-semibold">{m.count}</strong> {m.count === 1 ? "post" : "posts"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex gap-2 pl-8" aria-hidden="true">
        {months.map((m) => (
          <span key={`${m.label}-${m.year}`} className="flex-1 text-center font-mono text-[11px] text-subtle">
            {m.label}
          </span>
        ))}
      </div>

      <table className="sr-only">
        <caption>Posts published per month</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Posts</th>
          </tr>
        </thead>
        <tbody>
          {months.map((m) => (
            <tr key={`${m.label}-${m.year}`}>
              <td>
                {m.label} {m.year}
              </td>
              <td>{m.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
