import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { guardAdminRequest, jsonError } from "@/lib/admin";
import { validatePost } from "@/lib/blog/utils";
import { deletePosts, duplicatePost, getPostById, isSlugTaken, patchPost, updatePost } from "@/lib/blog/posts";

async function guard(request, params) {
  const denied = await guardAdminRequest(request);
  if (denied) return { denied };
  const { id } = await params;
  if (!ObjectId.isValid(id)) return { denied: jsonError("Post not found.", 404) };
  return { id };
}

export async function GET(request, { params }) {
  const { denied, id } = await guard(request, params);
  if (denied) return denied;
  const post = await getPostById(id);
  return post ? NextResponse.json({ ok: true, post }) : jsonError("Post not found.", 404);
}

/** PUT — full save from the editor */
export async function PUT(request, { params }) {
  const { denied, id } = await guard(request, params);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid request body.");

  const { data, errors, valid } = validatePost(body);
  if (!valid) return jsonError("Please fix the highlighted fields.", 422, { errors });
  if (await isSlugTaken(data.slug, id)) {
    return jsonError("That slug is already used by another post.", 409, { errors: { slug: "This slug is taken." } });
  }

  const post = await updatePost(id, data);
  if (!post) return jsonError("Post not found.", 404);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, post });
}

/** PATCH — quick actions: { status }, { featured }, or { action: "duplicate" } */
export async function PATCH(request, { params }) {
  const { denied, id } = await guard(request, params);
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) ?? {};

  if (body.action === "duplicate") {
    const post = await duplicatePost(id);
    return post ? NextResponse.json({ ok: true, post }, { status: 201 }) : jsonError("Post not found.", 404);
  }

  if (body.status === "published") {
    const current = await getPostById(id);
    if (!current) return jsonError("Post not found.", 404);
    if (!current.content?.trim()) return jsonError("Write some content before publishing.", 422);
  }

  const post = await patchPost(id, body);
  if (!post) return jsonError("Post not found.", 404);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, post });
}

export async function DELETE(request, { params }) {
  const { denied, id } = await guard(request, params);
  if (denied) return denied;
  const deleted = await deletePosts([id]);
  if (!deleted) return jsonError("Post not found.", 404);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
