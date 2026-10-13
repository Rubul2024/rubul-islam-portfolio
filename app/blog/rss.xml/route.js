import { getPublishedPosts } from "@/lib/blog/posts";
import { site } from "@/lib/site";

export const revalidate = 600;

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const { posts } = await getPublishedPosts({ perPage: 30 });

  const items = posts
    .map((post) => {
      const url = `${site.url}/blog/${post.slug}`;
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
${(post.tags || []).map((t) => `      <category>${escapeXml(t)}</category>`).join("\n")}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${site.name} — Blog`)}</title>
    <link>${site.url}/blog</link>
    <description>${escapeXml("Articles on full stack web development by " + site.name)}</description>
    <language>en-IN</language>
    <atom:link href="${site.url}/blog/rss.xml" rel="self" type="application/rss+xml" />${
      posts[0] ? `\n    <lastBuildDate>${new Date(posts[0].publishedAt).toUTCString()}</lastBuildDate>` : ""
    }${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
