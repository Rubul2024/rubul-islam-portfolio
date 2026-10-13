// Server-side helper: only import from Server Components.
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * True when public/resume.pdf exists. Resume buttons only render when the
 * real file is present, so the site never shows a broken download.
 * Evaluated at build time for static pages.
 */
export function hasResume() {
  try {
    return existsSync(path.join(process.cwd(), "public", "resume.pdf"));
  } catch {
    return false;
  }
}
