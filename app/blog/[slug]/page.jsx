import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Eye } from "lucide-react";
import Markdown from "@/components/blog/Markdown";
import PostCard from "@/components/blog/PostCard";
import PostCover from "@/components/blog/PostCover";
import TableOfContents from "@/components/blog/TableOfContents";
import ShareLinks from "@/components/blog/ShareLinks";
import ViewTracker from "@/components/blog/ViewTracker";
import { getAdjacentPosts, getPublishedPostBySlug, getPublishedSlugs, getRelatedPosts } from "@/lib/blog/posts";
import { extractHeadings, formatDate } from "@/lib/blog/utils";
import { ogImages, site } from "@/lib/site";
import { jsonLd } from "@/lib/utils";
import avatar from "@/public/images/rubul-islam-avatar.jpg";

// Pages are cached and rebuilt on demand when a post is saved in the admin
// panel; the time-based revalidate makes scheduled posts appear on time.
export const revalidate = 300;

export async function generateStaticParams() {
  return (await getPublishedSlugs()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Article not found", robots: { index: false } };

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  // The post's cover image, or the site's default share image.
  const images = post.coverImage?.url ? [{ url: post.coverImage.url, alt: post.coverImage.alt || post.title }] : ogImages;

  return {
    title,
    description,
    keywords: post.tags,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url: `/blog/${post.slug}`,
      title,
      description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [site.name],
      tags: post.tags,
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const [related, { previous, next }] = await Promise.all([getRelatedPosts(post), getAdjacentPosts(post)]);
  const headings = extractHeadings(post.content);
  const url = `${site.url}/blog/${post.slug}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    url,
    mainEntityOfPage: url,
    keywords: post.tags?.join(", "),
    ...(post.coverImage?.url && {
      image: post.coverImage.url.startsWith("/") ? `${site.url}${post.coverImage.url}` : post.coverImage.url,
    }),
    author: { "@id": `${site.url}/#person`, "@type": "Person", name: site.name, url: site.url },
    publisher: { "@id": `${site.url}/#person` },
  };

  return (
    <article className="relative isolate">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <ViewTracker slug={post.slug} />
      <div aria-hidden="true" className="grid-bg absolute inset-x-0 top-0 -z-10 h-[28rem]" />

      {/* Header */}
      <header className="container-x pt-28 md:pt-36">
        <div className="mx-auto max-w-3xl xl:max-w-6xl xl:[&>*]:max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
          >
            <ArrowLeft size={16} aria-hidden="true" /> All articles
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            {post.category && (
              <Link
                href={`/blog?category=${encodeURIComponent(post.category)}`}
                className="inline-flex items-center rounded-full border border-accent-text/25 bg-accent-soft px-2.5 py-1 font-mono text-[11px] leading-none tracking-wide text-accent-text transition-colors hover:border-accent-text/50"
              >
                {post.category}
              </Link>
            )}
            {post.tags?.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
                className="inline-flex items-center rounded-full border border-line bg-bg-2 px-2.5 py-1 font-mono text-[11px] leading-none tracking-wide text-muted transition-colors hover:text-fg"
              >
                #{tag}
              </Link>
            ))}
          </div>

          <h1 className="mt-6 text-balance text-3xl font-semibold leading-[1.12] tracking-tight text-fg sm:text-4xl md:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && <p className="mt-5 text-pretty text-lg leading-relaxed text-muted">{post.excerpt}</p>}

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-line py-4 text-sm text-muted">
            <span className="flex items-center gap-3">
              <Image src={avatar} alt="" width={36} height={36} className="size-9 rounded-full border border-line-strong object-cover" />
              <span>
                <span className="block font-medium text-fg">{site.name}</span>
                <span className="block text-xs text-subtle">{site.role}</span>
              </span>
            </span>
            <span className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-subtle sm:ml-auto">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, { dateStyle: "long" })}</time>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} aria-hidden="true" /> {post.readingTime} min read
              </span>
              {post.views > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Eye size={13} aria-hidden="true" /> {post.views.toLocaleString("en-IN")} views
                </span>
              )}
            </span>
          </div>
        </div>
      </header>

      {post.coverImage?.url && (
        <div className="container-x mt-10">
          <PostCover post={post} priority className="mx-auto aspect-[2/1] max-w-5xl rounded-3xl border border-line" />
        </div>
      )}

      {/* Body + table of contents */}
      <div className="container-x mt-12 md:mt-16">
        <div className="mx-auto grid max-w-3xl gap-12 xl:max-w-6xl xl:grid-cols-[minmax(0,48rem)_14rem] xl:justify-between">
          <div className="min-w-0">
            {headings.length >= 3 && (
              <details className="mb-10 rounded-2xl border border-line bg-card p-5 xl:hidden">
                <summary className="cursor-pointer text-sm font-medium text-fg">On this page</summary>
                <ul className="mt-4 space-y-2">
                  {headings.map((h) => (
                    <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
                      <a href={`#${h.id}`} className="text-sm text-muted hover:text-fg">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <Markdown>{post.content}</Markdown>

            <div className="mt-14 border-t border-line pt-8">
              <ShareLinks url={url} title={post.title} />
            </div>

            {/* Author card */}
            <aside className="mt-10 flex flex-col gap-5 rounded-2xl border border-line bg-card p-6 sm:flex-row sm:items-center">
              <Image src={avatar} alt={site.name} width={56} height={56} className="size-14 shrink-0 rounded-2xl border border-line-strong object-cover" />
              <div className="flex-1">
                <p className="font-medium text-fg">Written by {site.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {site.role} based in {site.location.city}, {site.location.country}. I build web interfaces, REST APIs and
                  MongoDB-backed applications.
                </p>
              </div>
              <Link
                href="/#contact"
                className="inline-flex h-10 shrink-0 items-center gap-1.5 self-start rounded-full bg-accent-strong px-4 text-sm font-medium text-white hover:brightness-110 sm:self-center"
              >
                Work with me <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </aside>

            {(previous || next) && (
              <nav aria-label="More articles" className="mt-10 grid gap-4 sm:grid-cols-2">
                {previous ? (
                  <Link
                    href={`/blog/${previous.slug}`}
                    className="group rounded-2xl border border-line p-5 transition-colors hover:border-line-strong"
                  >
                    <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
                      <ArrowLeft size={13} aria-hidden="true" /> Previous
                    </span>
                    <span className="mt-2 block font-medium leading-snug text-fg group-hover:text-accent-text">{previous.title}</span>
                  </Link>
                ) : (
                  <span className="hidden sm:block" />
                )}
                {next && (
                  <Link
                    href={`/blog/${next.slug}`}
                    className="group rounded-2xl border border-line p-5 text-right transition-colors hover:border-line-strong"
                  >
                    <span className="flex items-center justify-end gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
                      Next <ArrowRight size={13} aria-hidden="true" />
                    </span>
                    <span className="mt-2 block font-medium leading-snug text-fg group-hover:text-accent-text">{next.title}</span>
                  </Link>
                )}
              </nav>
            )}
          </div>

          {headings.length >= 3 && (
            <aside className="hidden xl:block">
              <div className="sticky top-28">
                <TableOfContents headings={headings} />
              </div>
            </aside>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-24 border-t border-line bg-bg-2">
          <div className="container-x py-16 md:py-20">
            <h2 id="related-title" className="text-2xl font-semibold tracking-tight text-fg">
              Keep reading
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
      {!related.length && <div className="pb-24" />}
    </article>
  );
}
