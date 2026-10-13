"use client";

import { useEffect } from "react";

/** Counts one view per post per browser session. Renders nothing. */
export default function ViewTracker({ slug }) {
  useEffect(() => {
    const key = `viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage blocked — still count once for this page load */
    }
    fetch(`/api/blog/${slug}/view`, { method: "POST", keepalive: true }).catch(() => {});
  }, [slug]);

  return null;
}
