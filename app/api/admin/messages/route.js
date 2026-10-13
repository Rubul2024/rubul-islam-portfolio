import { NextResponse } from "next/server";
import { guardAdminRequest, jsonError } from "@/lib/admin";
import { deleteMessages, getMessageCounts, listMessages } from "@/lib/messages";

/** GET /api/admin/messages?status=inbox|new|read|replied|archived|all&q=&page= */
export async function GET(request) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;

  const params = request.nextUrl.searchParams;
  const [result, counts] = await Promise.all([
    listMessages({
      status: params.get("status") || "inbox",
      q: params.get("q")?.trim() || "",
      page: Number(params.get("page")) || 1,
    }),
    getMessageCounts(),
  ]);
  return NextResponse.json({ ok: true, ...result, counts });
}

/** DELETE /api/admin/messages — body: { ids: [] } */
export async function DELETE(request) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const ids = Array.isArray(body?.ids) ? body.ids.slice(0, 100).map(String) : [];
  if (!ids.length) return jsonError("Select at least one message.");
  return NextResponse.json({ ok: true, deleted: await deleteMessages(ids) });
}
