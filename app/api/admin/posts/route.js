import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { guardAdminRequest, jsonError } from "@/lib/admin";
import { validatePost } from "@/lib/blog/utils";
import { createPost, deletePosts, isSlugTaken, listPostsAdmin } from "@/lib/blog/posts";

/** GET /api/admin/posts?q=&status=&sort=&page= */
export async function GET(request) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;

  const params = request.nextUrl.searchParams;
  const result = await listPostsAdmin({
    q: params.get("q")?.trim() || "",
    status: params.get("status") || "all",
    sort: params.get("sort") || "updated",
    page: Number(params.get("page")) || 1,
    perPage: Math.min(50, Number(params.get("perPage")) || 10),
  });
  return NextResponse.json({ ok: true, ...result });
}

/** POST /api/admin/posts — create a post */
export async function POST(request) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid request body.");

  const { data, errors, valid } = validatePost(body);
  if (!valid) return jsonError("Please fix the highlighted fields.", 422, { errors });
  if (await isSlugTaken(data.slug)) {
    return jsonError("That slug is already used by another post.", 409, { errors: { slug: "This slug is taken." } });
  }

  const post = await createPost(data);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, post }, { status: 201 });
}

/** DELETE /api/admin/posts — bulk delete, body: { ids: [] } */
export async function DELETE(request) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const ids = Array.isArray(body?.ids) ? body.ids.slice(0, 100).map(String) : [];
  if (!ids.length) return jsonError("Select at least one post.");

  const deleted = await deletePosts(ids);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, deleted });
}
