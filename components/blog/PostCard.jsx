import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import PostCover from "@/components/blog/PostCover";
import { formatDate } from "@/lib/blog/utils";
import { cn } from "@/lib/utils";

export function PostMeta({ post, className }) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle", className)}>
      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      <span aria-hidden="true" className="size-1 rounded-full bg-line-strong" />
      <span className="inline-flex items-center gap-1.5">
        <Clock size={12} aria-hidden="true" />
        {post.readingTime} min read
      </span>
    </p>
  );
}

/** Grid card used on /blog, the home page and "related posts". */
export default function PostCard({ post, headingLevel: H = "h3" }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong">
      <PostCover post={post} className="aspect-[2/1] border-b border-line" />
      <div className="flex flex-1 flex-col p-6">
        <PostMeta post={post} />
        <H className="mt-3 text-lg font-semibold leading-snug tracking-tight text-fg">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {post.title}
          </Link>
        </H>
        <p className="mt-2.5 line-clamp-3 text-pretty text-sm leading-relaxed text-muted">{post.excerpt}</p>
        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
            {post.tags?.slice(0, 3).map((tag) => (
              <li key={tag} className="rounded-md border border-line bg-bg-2 px-2 py-1 font-mono text-[11px] text-muted">
                #{tag}
              </li>
            ))}
          </ul>
          <ArrowUpRight
            size={18}
            aria-hidden="true"
            className="shrink-0 text-subtle transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-text"
          />
        </div>
      </div>
      {/* Card-wide focus ring for the stretched link */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl ring-accent-text group-has-[a:focus-visible]:ring-2" />
    </article>
  );
}

/** Wide card for the featured / latest post at the top of /blog. */
export function FeaturedPostCard({ post }) {
  return (
    <article className="group relative grid overflow-hidden rounded-3xl border border-line bg-card transition-colors hover:border-line-strong lg:grid-cols-[1.15fr_1fr]">
      <PostCover post={post} priority className="aspect-[16/9] border-b border-line lg:aspect-auto lg:min-h-[22rem] lg:border-b-0 lg:border-r" />
      <div className="flex flex-col p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-accent-text/25 bg-accent-soft px-2.5 py-1 font-mono text-[11px] leading-none tracking-wide text-accent-text">
            {post.featured ? "Featured" : "Latest"}
          </span>
          {post.category && (
            <span className="inline-flex items-center rounded-full border border-line bg-bg-2 px-2.5 py-1 font-mono text-[11px] leading-none tracking-wide text-muted">
              {post.category}
            </span>
          )}
        </div>
        <h2 className="mt-6 text-balance text-2xl font-semibold leading-tight tracking-tight text-fg sm:text-3xl">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {post.title}
          </Link>
        </h2>
        <p className="mt-4 text-pretty leading-relaxed text-muted">{post.excerpt}</p>
        <PostMeta post={post} className="mt-auto pt-8" />
      </div>
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-3xl ring-accent-text group-has-[a:focus-visible]:ring-2" />
    </article>
  );
}
