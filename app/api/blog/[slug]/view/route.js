import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { incrementViews } from "@/lib/blog/posts";

// Counts one view per browser session (the client de-duplicates with
// sessionStorage). Bots that don't run JavaScript are never counted.
export async function POST(_request, { params }) {
  const { slug } = await params;
  if (!isDbConfigured() || !/^[a-z0-9-]{1,100}$/.test(slug)) return NextResponse.json({ ok: false }, { status: 404 });
  try {
    const counted = await incrementViews(slug);
    return NextResponse.json({ ok: counted }, { status: counted ? 200 : 404 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
