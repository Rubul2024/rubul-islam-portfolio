import { NextResponse } from "next/server";
import { guardAdminRequest, jsonError } from "@/lib/admin";
import { ALLOWED_TYPES, MAX_UPLOAD_BYTES, listMedia, saveMedia, sniffImageType } from "@/lib/blog/media";

export async function GET(request) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  const items = await listMedia({ before: request.nextUrl.searchParams.get("before") || undefined });
  return NextResponse.json({ ok: true, items });
}

/** POST multipart/form-data with a "file" field */
export async function POST(request) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") return jsonError("Choose an image to upload.");
  if (file.size > MAX_UPLOAD_BYTES) return jsonError("Images must be 4 MB or smaller.", 413);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType = sniffImageType(bytes);
  if (!contentType || !ALLOWED_TYPES[contentType]) {
    return jsonError("Only JPG, PNG, WebP, GIF and AVIF images are supported.", 415);
  }

  const item = await saveMedia({ filename: file.name || "image", contentType, bytes });
  return NextResponse.json({ ok: true, item }, { status: 201 });
}
