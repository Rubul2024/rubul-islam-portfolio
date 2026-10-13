import Link from "next/link";
import { ogImages } from "@/lib/site";
import { ChevronLeft, ChevronRight, Rss, Search, X } from "lucide-react";
import PostCard, { FeaturedPostCard } from "@/components/blog/PostCard";
import { getCategoryCounts, getFeaturedPost, getPublishedPosts, getTagCounts } from "@/lib/blog/posts";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Blog",
  description:
    "Articles by Rubul Islam on full stack web development — tutorials, guides, case studies and notes on React, Node.js, MongoDB, WordPress and testing.",
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
  openGraph: { url: "/blog", images: ogImages },
};

const PER_PAGE = 9;

function blogHref({ category, tag, q, page }) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (tag) params.set("tag", tag);
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}

const pill = (active) =>
  cn(
    "inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-[13px] transition-colors",
    active ? "border-accent-text/40 bg-accent-soft font-medium text-fg" : "border-line text-muted hover:border-line-strong hover:text-fg",
  );

export default async function BlogPage({ searchParams }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 80) : "";
  const tag = typeof sp.tag === "string" ? sp.tag.trim().toLowerCase() : "";
  const category = typeof sp.category === "string" ? sp.category.trim().slice(0, 40) : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const filtered = Boolean(q || tag || category);
  const showFeatured = !filtered && page === 1;

  const [{ posts, total, totalPages, page: current }, categories, tags, featured] = await Promise.all([
    getPublishedPosts({ q, tag, category, page, perPage: PER_PAGE }),
    getCategoryCounts(),
    getTagCounts(),
    showFeatured ? getFeaturedPost() : null,
  ]);

  const gridPosts = featured ? posts.filter((p) => p.id !== featured.id) : posts;
  const allCount = categories.reduce((sum, c) => sum + c.count, 0);
  const activeCategory = categories.find((c) => c.category.toLowerCase() === category.toLowerCase())?.category ?? category;

  return (
    <div className="relative isolate">
      <div aria-hidden="true" className="grid-bg absolute inset-x-0 top-0 -z-10 h-[24rem]" />
      <div className="container-x pb-20 pt-28 md:pt-32">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-subtle">Blog</p>
            <h1 className="mt-3 text-balance text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-4xl md:text-[2.75rem]">
              Notes on building for the web.
            </h1>
            <p className="mt-3 text-pretty text-base leading-relaxed text-muted sm:text-lg">
              Tutorials, guides and lessons from real projects — React, Node.js, MongoDB, WordPress and testing.
            </p>
          </div>
          <a
            href="/blog/rss.xml"
            className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full border border-line px-4 text-sm text-muted transition-colors hover:border-line-strong hover:text-fg md:self-auto"
          >
            <Rss size={15} aria-hidden="true" />
            RSS
          </a>
        </div>

        {/* Filters: post type + search */}
        <div className="mt-10 flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Post types" className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <ul className="flex gap-2">
              <li>
                <Link href={blogHref({ q, tag })} aria-current={!category ? "page" : undefined} className={pill(!category)}>
                  All posts
                  {allCount > 0 && <span className="font-mono text-[11px] text-subtle">{allCount}</span>}
                </Link>
              </li>
              {categories.map((c) => {
                const active = c.category.toLowerCase() === category.toLowerCase();
                return (
                  <li key={c.category}>
                    <Link
                      href={blogHref({ category: c.category, q, tag })}
                      aria-current={active ? "page" : undefined}
                      className={pill(active)}
                    >
                      {c.category}
                      <span className="font-mono text-[11px] text-subtle">{c.count}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <form action="/blog" role="search" className="relative w-full lg:w-80">
            <label htmlFor="blog-search" className="sr-only">
              Search articles
            </label>
            <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              id="blog-search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search articles…"
              className="h-10 w-full rounded-full border border-line bg-card pl-11 pr-4 text-sm text-fg placeholder:text-subtle focus:border-accent-text/50 focus:outline-none"
            />
            {category && <input type="hidden" name="category" value={category} />}
            {tag && <input type="hidden" name="tag" value={tag} />}
          </form>
        </div>

        {/* Topics (tags) */}
        {tags.length > 0 && (
          <nav aria-label="Topics" className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-2">
            <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">Topics</span>
            {tags.map((t) => {
              const active = tag === t.tag;
              return (
                <Link
                  key={t.tag}
                  href={blogHref({ category, q, tag: active ? "" : t.tag })}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-2 py-1 font-mono text-xs transition-colors",
                    active ? "bg-accent-soft text-accent-text" : "text-muted hover:bg-card hover:text-fg",
                  )}
                >
                  #{t.tag}
                </Link>
              );
            })}
          </nav>
        )}

        {filtered && (
          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted" aria-live="polite">
            <span>
              {total} {total === 1 ? "article" : "articles"}
              {activeCategory && <> in <span className="text-fg">{activeCategory}</span></>}
              {tag && <> tagged <span className="text-fg">#{tag}</span></>}
              {q && <> matching “<span className="text-fg">{q}</span>”</>}
            </span>
            <Link href="/blog" className="inline-flex items-center gap-1 text-accent-text hover:underline">
              <X size={14} aria-hidden="true" /> Clear
            </Link>
          </p>
        )}

        {featured && (
          <div className="mt-8">
            <FeaturedPostCard post={featured} />
          </div>
        )}

        {gridPosts.length > 0 ? (
          <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", featured ? "mt-6" : "mt-8")}>
            {gridPosts.map((post) => (
              <PostCard key={post.id} post={post} headingLevel="h2" />
            ))}
          </div>
        ) : (
          !featured && (
            <div className="mt-8 rounded-3xl border border-dashed border-line-strong p-10 text-center sm:p-16">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent-text">
                {filtered ? "No matches" : "Coming soon"}
              </p>
              <p className="mx-auto mt-3 max-w-md text-muted">
                {filtered
                  ? "No articles match these filters yet. Try another type, topic or keyword."
                  : "The first articles are being written. Check back soon — or subscribe to the RSS feed."}
              </p>
            </div>
          )
        )}

        {totalPages > 1 && (
          <nav aria-label="Pagination" className="mt-12 flex items-center justify-between gap-4 border-t border-line pt-6">
            {current > 1 ? (
              <Link
                href={blogHref({ category, tag, q, page: current - 1 })}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm text-muted hover:border-line-strong hover:text-fg"
              >
                <ChevronLeft size={16} aria-hidden="true" /> Newer
              </Link>
            ) : (
              <span />
            )}
            <span className="font-mono text-xs text-subtle">
              Page {current} of {totalPages}
            </span>
            {current < totalPages ? (
              <Link
                href={blogHref({ category, tag, q, page: current + 1 })}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm text-muted hover:border-line-strong hover:text-fg"
              >
                Older <ChevronRight size={16} aria-hidden="true" />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
