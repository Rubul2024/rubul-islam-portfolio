"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { LinkedinIcon } from "@/components/ui/BrandIcons";

const buttonClass =
  "inline-flex h-9 items-center gap-2 rounded-full border border-line px-3.5 text-[13px] text-muted transition-colors hover:border-line-strong hover:text-fg";

function XIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function ShareLinks({ url, title }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  const encodedUrl = encodeURIComponent(url);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Share</span>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
      >
        <LinkedinIcon size={14} /> LinkedIn
      </a>
      <a
        href={`https://x.com/intent/post?url=${encodedUrl}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
      >
        <XIcon /> Post
      </a>
      <button type="button" onClick={copy} className={buttonClass}>
        {copied ? <Check size={14} aria-hidden="true" className="text-success" /> : <Link2 size={14} aria-hidden="true" />}
        <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
      </button>
    </div>
  );
}
