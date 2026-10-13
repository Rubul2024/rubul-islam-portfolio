"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "theme";

// The theme lives on <html data-theme>, set before paint by the boot script in
// layout.jsx. Subscribing to that attribute keeps every toggle on the page in sync.
function subscribe(callback) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const getSnapshot = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");
// Unknown during server rendering; avoids a hydration mismatch.
const getServerSnapshot = () => null;

const TONES = {
  default: "border-line text-muted hover:border-line-strong hover:text-fg",
  // For use on an inverted surface (the floating navbar pill)
  inverted: "border-bg/15 text-bg/70 hover:border-bg/30 hover:text-bg",
};

export default function ThemeToggle({ className = "", tone = "default" }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable (private mode) — theme still applies for this visit */
    }
  }

  const isLight = theme === "light";
  const label = isLight ? "Switch to dark theme" : "Switch to light theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`grid size-10 place-items-center rounded-full border transition-colors ${TONES[tone]} ${className}`}
    >
      {theme === null ? (
        <span className="size-[18px]" aria-hidden="true" />
      ) : isLight ? (
        <Moon size={18} aria-hidden="true" />
      ) : (
        <Sun size={18} aria-hidden="true" />
      )}
    </button>
  );
}
