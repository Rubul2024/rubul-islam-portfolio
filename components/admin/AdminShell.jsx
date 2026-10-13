"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, FileText, Image as ImageIcon, Inbox, LayoutDashboard, LogOut, Menu, PenSquare, X } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { ToastProvider, buttonClass } from "@/components/admin/ui";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/posts/new", label: "New post", icon: PenSquare, exact: true },
  { href: "/admin/messages", label: "Messages", icon: Inbox, badge: "unread" },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
];

function isActive(pathname, item) {
  if (item.exact) return pathname === item.href;
  // "Posts" stays active while editing, but not on "New post".
  return pathname.startsWith(item.href) && pathname !== "/admin/posts/new";
}

function Sidebar({ pathname, email, unread, onNavigate, onLogout, loggingOut }) {
  return (
    <div className="flex h-full flex-col">
      <Link href="/admin" onClick={onNavigate} className="flex items-center gap-3 px-2">
        <span className="relative grid size-9 place-items-center rounded-[10px] border border-line-strong bg-bg-2 font-mono text-[13px] font-semibold text-fg">
          {site.monogram}
          <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-accent" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-fg">Blog Studio</span>
          <span className="block font-mono text-[11px] text-subtle">Admin panel</span>
        </span>
      </Link>

      <nav aria-label="Admin" className="mt-8">
        <ul className="grid gap-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors",
                    active ? "bg-accent-soft font-medium text-fg" : "text-muted hover:bg-card hover:text-fg",
                  )}
                >
                  <Icon size={17} aria-hidden="true" className={active ? "text-accent-text" : ""} />
                  {item.label}
                  {item.badge && unread > 0 && (
                    <span className="ml-auto rounded-full bg-accent-strong px-1.5 py-px font-mono text-[10px] font-semibold text-white">
                      {unread > 99 ? "99+" : unread}
                      <span className="sr-only"> unread</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-6 border-t border-line pt-6">
        <a
          href="/blog"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-muted transition-colors hover:bg-card hover:text-fg"
        >
          <ExternalLink size={17} aria-hidden="true" />
          View blog
        </a>
      </div>

      <div className="mt-auto grid gap-3 border-t border-line pt-5">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-fg">{site.name}</p>
            <p className="truncate font-mono text-[11px] text-subtle" title={email}>
              {email}
            </p>
          </div>
          <ThemeToggle className="size-9 shrink-0" />
        </div>
        <button type="button" onClick={onLogout} disabled={loggingOut} className={cn(buttonClass.ghost, "justify-start")}>
          <LogOut size={17} aria-hidden="true" />
          {loggingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

export default function AdminShell({ email, unread = 0, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  }

  const sidebarProps = { pathname, email, unread, onLogout: logout, loggingOut };

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-bg lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-dvh border-r border-line bg-bg-2 p-5 lg:block">
          <Sidebar {...sidebarProps} />
        </aside>

        {/* Mobile top bar */}
        <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-bg/85 px-4 backdrop-blur-xl lg:hidden">
          <Link href="/admin" className="text-sm font-semibold text-fg">
            Blog Studio
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={unread ? `Open menu (${unread} unread messages)` : "Open menu"}
            aria-expanded={open}
            aria-controls="admin-drawer"
            className={buttonClass.icon}
          >
            <span className="relative">
              <Menu size={20} aria-hidden="true" />
              {unread > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 size-2 rounded-full bg-accent" />}
            </span>
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <aside id="admin-drawer" className="absolute inset-y-0 left-0 w-72 max-w-[85%] border-r border-line bg-bg-2 p-5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className={cn(buttonClass.icon, "absolute right-3 top-3")}
              >
                <X size={18} aria-hidden="true" />
              </button>
              <Sidebar {...sidebarProps} onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        )}

        <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </div>
    </ToastProvider>
  );
}

/** Page title row used at the top of each admin screen. */
export function AdminHeader({ title, description, actions }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-[1.75rem]">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
