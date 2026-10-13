import Link from "next/link";
import { ArrowRight, CalendarClock, Eye, FilePen, FileText, Globe, Inbox, PenSquare } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminShell";
import PublishingChart from "@/components/admin/PublishingChart";
import { Card, StatusBadge } from "@/components/admin/ui";
import { buttonClass } from "@/components/admin/styles";
import { getDashboardStats } from "@/lib/blog/posts";
import { isDbConfigured } from "@/lib/db";
import { formatDate } from "@/lib/blog/utils";
import { getLatestMessages, getMessageCounts } from "@/lib/messages";
import { getAdminSession } from "@/lib/admin";

export const metadata = { title: "Dashboard" };

const EMPTY = {
  counts: { total: 0, published: 0, drafts: 0, scheduled: 0, views: 0 },
  recent: [],
  top: [],
  months: [],
  tags: [],
};

async function loadInbox() {
  if (!isDbConfigured()) return { latest: [], unread: 0 };
  try {
    const [latest, counts] = await Promise.all([getLatestMessages(4), getMessageCounts()]);
    return { latest, unread: counts.new };
  } catch {
    return { latest: [], unread: 0 };
  }
}

async function loadStats() {
  if (!isDbConfigured()) return { stats: EMPTY, error: null };
  try {
    return { stats: await getDashboardStats(), error: null };
  } catch (error) {
    console.error("[admin] dashboard", error?.message);
    return { stats: EMPTY, error: "Couldn't reach the database. Check MONGODB_URI and your network access list." };
  }
}

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Kolkata" }).format(new Date()));
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

export default async function DashboardPage() {
  const session = await getAdminSession();
  const firstName = (session?.name || "there").split(" ")[0];
  const [{ stats, error }, inbox] = await Promise.all([loadStats(), loadInbox()]);
  const { counts } = stats;

  const tiles = [
    { label: "Published", value: counts.published, icon: Globe, href: "/admin/posts?status=published" },
    { label: "Drafts", value: counts.drafts, icon: FilePen, href: "/admin/posts?status=draft" },
    { label: "Scheduled", value: counts.scheduled, icon: CalendarClock, href: "/admin/posts?status=scheduled" },
    { label: "Total views", value: counts.views, icon: Eye, href: "/admin/posts?sort=views" },
  ];

  return (
    <>
      <AdminHeader
        title={`${greeting()}, ${firstName}`}
        description={
          inbox.unread
            ? `You have ${inbox.unread} new ${inbox.unread === 1 ? "enquiry" : "enquiries"} waiting.`
            : "Here's how your blog is doing."
        }
        actions={
          <Link href="/admin/posts/new" className={buttonClass.primary}>
            <PenSquare size={16} aria-hidden="true" /> Write a post
          </Link>
        }
      />

      {error && (
        <p role="alert" className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {tiles.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="group rounded-2xl border border-line bg-card p-5 transition-colors hover:border-line-strong">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-muted">{label}</span>
              <Icon size={16} aria-hidden="true" className="text-subtle transition-colors group-hover:text-accent-text" />
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-fg tabular-nums">{value.toLocaleString("en-IN")}</p>
          </Link>
        ))}
      </div>

      {/* Latest enquiries */}
      {inbox.latest.length > 0 && (
        <Card className="mt-6">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
              <Inbox size={16} aria-hidden="true" className="text-accent-text" /> Latest enquiries
              {inbox.unread > 0 && (
                <span className="rounded-full bg-accent-strong px-2 py-px font-mono text-[10px] text-white">{inbox.unread} new</span>
              )}
            </h2>
            <Link href="/admin/messages" className="inline-flex items-center gap-1 text-xs text-muted hover:text-fg">
              Open inbox <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
          <ul className="grid divide-y divide-line md:grid-cols-2 md:divide-y-0 xl:grid-cols-4">
            {inbox.latest.map((m) => (
              <li key={m.id} className="md:border-r md:border-line md:last:border-r-0">
                <Link href={`/admin/messages?open=${m.id}`} className="block h-full px-5 py-4 transition-colors hover:bg-card-hover">
                  <p className="flex items-center gap-2">
                    {m.status === "new" && <span aria-label="Unread" className="size-2 shrink-0 rounded-full bg-accent" />}
                    <span className={`truncate text-sm ${m.status === "new" ? "font-semibold text-fg" : "text-fg/90"}`}>{m.name}</span>
                  </p>
                  <p className="mt-0.5 truncate text-xs text-accent-text">{m.projectType}</p>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-muted">{m.message}</p>
                  <p className="mt-2 font-mono text-[10px] text-subtle">{formatDate(m.createdAt)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Recent activity */}
        <Card>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold text-fg">Recently edited</h2>
            <Link href="/admin/posts" className="inline-flex items-center gap-1 text-xs text-muted hover:text-fg">
              All posts <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
          {stats.recent.length ? (
            <ul className="divide-y divide-line">
              {stats.recent.map((post) => (
                <li key={post.id}>
                  <Link href={`/admin/posts/${post.id}`} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-card-hover">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg">{post.title}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-subtle">Updated {formatDate(post.updatedAt)}</p>
                    </div>
                    <StatusBadge post={post} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-12 text-center">
              <FileText size={28} aria-hidden="true" className="mx-auto text-subtle" />
              <p className="mt-3 text-sm font-medium text-fg">No posts yet</p>
              <p className="mt-1 text-sm text-muted">Your first article is one click away.</p>
              <Link href="/admin/posts/new" className={`${buttonClass.primary} mt-5`}>
                <PenSquare size={16} aria-hidden="true" /> Write your first post
              </Link>
            </div>
          )}
        </Card>

        {/* Publishing cadence */}
        <Card className="p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-fg">Posts published per month</h2>
            <span className="font-mono text-[11px] text-subtle">Last 6 months</span>
          </div>
          <div className="mt-6">
            {stats.months.length ? (
              <PublishingChart months={stats.months} />
            ) : (
              <p className="py-10 text-center text-sm text-muted">Publishing activity appears here.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Most read */}
        <Card>
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold text-fg">Most read</h2>
          </div>
          {stats.top.length ? (
            <ol className="divide-y divide-line">
              {stats.top.map((post, i) => (
                <li key={post.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="w-5 font-mono text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1 truncate text-sm text-fg hover:text-accent-text"
                  >
                    {post.title}
                  </a>
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted tabular-nums">
                    <Eye size={13} aria-hidden="true" /> {post.views.toLocaleString("en-IN")}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-muted">Views from published posts will show here.</p>
          )}
        </Card>

        {/* Tags */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-fg">Tags</h2>
          {stats.tags.length ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {stats.tags.map((t) => (
                <li key={t.tag}>
                  <Link
                    href={`/admin/posts?q=${encodeURIComponent(t.tag)}`}
                    className="inline-flex h-8 items-center gap-2 rounded-full border border-line px-3 text-[13px] text-muted transition-colors hover:border-line-strong hover:text-fg"
                  >
                    #{t.tag} <span className="font-mono text-[11px] text-subtle">{t.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">Tags you add to posts are listed here.</p>
          )}
          <p className="mt-6 border-t border-line pt-4 text-xs text-subtle">
            {counts.total} {counts.total === 1 ? "post" : "posts"} in total
          </p>
        </Card>
      </div>
    </>
  );
}
