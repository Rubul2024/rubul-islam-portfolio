import { cn } from "@/lib/utils";

/**
 * Cover image for a post. Posts without one get a typographic placeholder
 * built from the category, so the grid never shows broken or empty boxes.
 */
export default function PostCover({ post, className, priority = false }) {
  if (post.coverImage?.url) {
    return (
      <div className={cn("overflow-hidden bg-bg-2", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- uploaded or remote images of unknown size */}
        <img
          src={post.coverImage.url}
          alt={post.coverImage.alt || ""}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  const label = post.category || post.tags?.[0] || "Article";
  return (
    <div
      aria-hidden="true"
      className={cn("relative isolate overflow-hidden bg-bg-2", className)}
    >
      <div className="grid-bg absolute inset-0 -z-10 opacity-70 [mask-image:none]" />
      <div className="absolute -right-16 -top-16 -z-10 size-56 rounded-full bg-[radial-gradient(closest-side,var(--accent-soft),transparent)]" />
      <div className="flex size-full flex-col justify-between p-5">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-text">{label}</span>
        <span className="self-end font-mono text-4xl font-semibold tracking-tight text-fg/10 sm:text-5xl">
          {post.tags?.length ? `#${post.tags[0]}` : "</>"}
        </span>
      </div>
    </div>
  );
}
