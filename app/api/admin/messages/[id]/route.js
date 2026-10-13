import { NextResponse } from "next/server";
import { guardAdminRequest, jsonError } from "@/lib/admin";
import { deleteMessages, getMessage, updateMessage } from "@/lib/messages";

export async function GET(request, { params }) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  const { id } = await params;
  const message = await getMessage(id);
  return message ? NextResponse.json({ ok: true, message }) : jsonError("Message not found.", 404);
}

/** PATCH — { status?: "new"|"read"|"replied"|"archived", notes?: string } */
export async function PATCH(request, { params }) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  const { id } = await params;
  const body = (await request.json().catch(() => null)) ?? {};
  const message = await updateMessage(id, { status: body.status, notes: body.notes });
  return message ? NextResponse.json({ ok: true, message }) : jsonError("Message not found.", 404);
}

export async function DELETE(request, { params }) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  const { id } = await params;
  return (await deleteMessages([id])) ? NextResponse.json({ ok: true }) : jsonError("Message not found.", 404);
}
