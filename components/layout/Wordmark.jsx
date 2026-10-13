import Link from "next/link";
import { Herr_Von_Muellerhoff } from "next/font/google";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

// Handwritten signature used as the logo. Only these few glyphs are visible,
// so the font is small, and `swap` keeps the name readable while it loads.
const signature = Herr_Von_Muellerhoff({ weight: "400", subsets: ["latin"], display: "swap" });

/**
 * Signature logo. `tone="inverted"` is for the light/dark-flipped floating
 * navbar pill.
 */
export default function Wordmark({ className = "", tone = "default" }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} — home`}
      className={cn("group relative inline-flex items-center px-1", className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          signature.className,
          "inline-block -rotate-3 whitespace-nowrap pt-1 text-[2.15rem] leading-none transition-colors duration-300",
          tone === "inverted" ? "text-bg group-hover:text-accent-strong" : "text-fg group-hover:text-accent-text",
        )}
      >
        {site.name}
      </span>
      <span aria-hidden="true" className="ml-1 size-1.5 self-start rounded-full bg-accent" />
    </Link>
  );
}
