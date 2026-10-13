import { NextResponse } from "next/server";
import { guardAdminRequest, jsonError } from "@/lib/admin";
import { deleteMedia } from "@/lib/blog/media";

export async function DELETE(request, { params }) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  const { id } = await params;
  return (await deleteMedia(id)) ? NextResponse.json({ ok: true }) : jsonError("Image not found.", 404);
}
