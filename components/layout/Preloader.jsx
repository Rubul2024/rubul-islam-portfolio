"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const COUNT_MS = 1300; // 0 → 100%
const REDUCED_MS = 450;
const EXIT_MS = 900; // matches .preloader-leave transition

/**
 * Name intro shown on every full page load (refresh or first visit), not on
 * in-app navigation — the root layout mounts it once.
 *
 * Safeguards: it is server-rendered so it covers the page from the first
 * paint; it's hidden entirely without JavaScript (html:not(.js)); a CSS
 * fail-safe removes it after a few seconds even if hydration never happens.
 */
export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("loading"); // loading | leaving | done
  const visible = phase !== "done";

  // Count up, then start the exit.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = reduce ? REDUCED_MS : COUNT_MS;
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / total);
      setProgress(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) frame = requestAnimationFrame(tick);
      else setPhase("leaving");
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (phase !== "leaving") return;
    const t = setTimeout(() => setPhase("done"), EXIT_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // No scrolling behind the intro.
  useEffect(() => {
    if (!visible) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "preloader fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-bg px-4",
        phase === "leaving" && "preloader-leave",
      )}
    >
      <div aria-hidden="true" className="grid-bg absolute inset-0 opacity-60" />
      <div className="relative text-center">
        {/* One line; the size follows the screen width so it never wraps */}
        <p className="overflow-hidden whitespace-nowrap pb-[0.06em] text-[clamp(2.5rem,12.5vw,11rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em]">
          <span className="preloader-line inline-block text-fg">Rubul</span>{" "}
          <span className="preloader-line preloader-line-2 inline-block text-subtle/80">Islam</span>
        </p>
        <p className="preloader-sub mt-8 font-mono text-[11px] uppercase tracking-[0.32em] text-muted sm:text-xs">
          Full Stack Developer · MERN
        </p>
      </div>

      <span className="absolute bottom-5 right-5 font-mono text-xs tabular-nums text-subtle sm:bottom-7 sm:right-8">
        {progress}%
      </span>
      <span
        className="absolute bottom-0 left-0 h-0.5 bg-accent transition-[width] duration-100 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
