import { isDbConfigured } from "@/lib/db";
import { getMediaFile } from "@/lib/blog/media";

/** Public image delivery. IDs never change content, so cache forever. */
export async function GET(_request, { params }) {
  const { id } = await params;
  if (!isDbConfigured()) return new Response("Not found", { status: 404 });

  const file = await getMediaFile(id).catch(() => null);
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(file.data.buffer, {
    headers: {
      "Content-Type": file.contentType,
      "Content-Length": String(file.size),
      // s-maxage lets the CDN (e.g. Vercel's) serve repeat requests without touching the database.
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "Content-Security-Policy": "default-src 'none'",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
