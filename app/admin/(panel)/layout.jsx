import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminSession } from "@/lib/admin";
import { isDbConfigured } from "@/lib/db";
import { getMessageCounts } from "@/lib/messages";

// Every admin screen is per-request and private.
export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const unread = isDbConfigured() ? await getMessageCounts().then((c) => c.new).catch(() => 0) : 0;

  return (
    <AdminShell email={session.sub} unread={unread}>
      {!isDbConfigured() && (
        <div role="alert" className="mb-8 flex gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-fg">
          <AlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-danger" />
          <p>
            <strong className="font-semibold">Database not connected.</strong> Add <code className="font-mono">MONGODB_URI</code>{" "}
            to <code className="font-mono">.env.local</code> (and to your host&apos;s environment variables), then restart the server.
            Posts can&apos;t be saved until then.
          </p>
        </div>
      )}
      {children}
    </AdminShell>
  );
}
