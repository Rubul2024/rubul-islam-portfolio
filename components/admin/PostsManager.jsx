"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  MoreHorizontal,
  Pencil,
  PenSquare,
  Search,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { Card, ConfirmDialog, Spinner, StatusBadge, api, buttonClass, inputClass, relativeTime, useToast } from "@/components/admin/ui";
import { postState } from "@/lib/blog/utils";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "scheduled", label: "Scheduled" },
  { value: "featured", label: "Featured" },
];

const SORTS = [
  { value: "updated", label: "Last updated" },
  { value: "newest", label: "Newest first" },
  { value: "published", label: "Publish date" },
  { value: "views", label: "Most viewed" },
  { value: "title", label: "Title A–Z" },
];

function RowMenu({ post, onAction }) {
  const [position, setPosition] = useState(null); // fixed-position coordinates while open
  const ref = useRef(null);
  const buttonRef = useRef(null);
  const open = Boolean(position);

  // The table scrolls horizontally, which would clip an absolutely positioned
  // menu, so the menu is fixed to the viewport next to its button.
  function toggle() {
    if (open) return setPosition(null);
    const rect = buttonRef.current.getBoundingClientRect();
    const right = window.innerWidth - rect.right;
    setPosition(
      rect.bottom + 220 > window.innerHeight ? { bottom: window.innerHeight - rect.top + 4, right } : { top: rect.bottom + 4, right },
    );
  }

  useEffect(() => {
    if (!open) return;
    const close = (e) => !ref.current?.contains(e.target) && setPosition(null);
    const onKey = (e) => e.key === "Escape" && (setPosition(null), buttonRef.current?.focus());
    const onScroll = () => setPosition(null);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  const live = postState(post) === "published";
  const items = [
    post.status === "published"
      ? { key: "unpublish", label: "Move to drafts", icon: EyeOff }
      : { key: "publish", label: "Publish now", icon: Eye },
    post.featured ? { key: "unfeature", label: "Remove from featured", icon: StarOff } : { key: "feature", label: "Mark as featured", icon: Star },
    { key: "duplicate", label: "Duplicate", icon: Copy },
    { key: "delete", label: "Delete", icon: Trash2, danger: true },
  ];

  return (
    <div ref={ref} className="relative flex items-center justify-end gap-0.5">
      <Link href={`/admin/posts/${post.id}`} className={buttonClass.icon} aria-label={`Edit ${post.title}`} title="Edit">
        <Pencil size={16} aria-hidden="true" />
      </Link>
      {live && (
        <a
          href={`/blog/${post.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass.icon}
          aria-label={`View ${post.title} on the blog`}
          title="View live"
        >
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      )}
      <button
        type="button"
        ref={buttonRef}
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`More actions for ${post.title}`}
        className={buttonClass.icon}
      >
        <MoreHorizontal size={16} aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" style={position} className="fixed z-50 w-52 rounded-xl border border-line-strong bg-card p-1 shadow-card">
          {items.map(({ key, label, icon: Icon, danger }) => (
            <button
              key={key}
              type="button"
              role="menuitem"
              onClick={() => {
                setPosition(null);
                onAction(key, post);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-card-hover",
                danger ? "text-danger" : "text-fg",
              )}
            >
              <Icon size={15} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostsManager({ initial }) {
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState(initial);
  const [search, setSearch] = useState(initial.q);
  const [result, setResult] = useState({ posts: [], total: 0, page: 1, totalPages: 1 });
  const [loadedKey, setLoadedKey] = useState(null); // filters the current result belongs to
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [confirm, setConfirm] = useState(null); // { ids, label }
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (q, signal) => {
    try {
      const params = new URLSearchParams({ q: q.q, status: q.status, sort: q.sort, page: String(q.page) });
      const data = await api(`/api/admin/posts?${params}`, { signal });
      setResult(data);
      setSelected(new Set());
      setError("");
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message);
    }
    setLoadedKey(JSON.stringify(q));
  }, []);
  const loading = loadedKey !== JSON.stringify(query);

  // Reload whenever filters change, and mirror them in the URL.
  useEffect(() => {
    const controller = new AbortController();
    // State is only set after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(query, controller.signal);
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.status !== "all") params.set("status", query.status);
    if (query.sort !== "updated") params.set("sort", query.sort);
    if (query.page > 1) params.set("page", String(query.page));
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/admin/posts?${qs}` : "/admin/posts");
    return () => controller.abort();
  }, [query, load]);

  // Debounced search
  useEffect(() => {
    if (search === query.q) return;
    const t = setTimeout(() => setQuery((q) => ({ ...q, q: search.trim(), page: 1 })), 300);
    return () => clearTimeout(t);
  }, [search, query.q]);

  const update = (patch) => setQuery((q) => ({ ...q, page: 1, ...patch }));

  async function onAction(key, post) {
    if (key === "delete") return setConfirm({ ids: [post.id], label: `“${post.title}”` });
    try {
      if (key === "duplicate") {
        const { post: copy } = await api(`/api/admin/posts/${post.id}`, { method: "PATCH", body: { action: "duplicate" } });
        toast("Post duplicated as a draft.");
        router.push(`/admin/posts/${copy.id}`);
        return;
      }
      const body =
        key === "publish" ? { status: "published" } : key === "unpublish" ? { status: "draft" } : { featured: key === "feature" };
      await api(`/api/admin/posts/${post.id}`, { method: "PATCH", body });
      toast(
        {
          publish: "Post published.",
          unpublish: "Post moved to drafts.",
          feature: "Marked as featured.",
          unfeature: "Removed from featured.",
        }[key],
      );
      load(query);
    } catch (err) {
      toast(err.message, "error");
    }
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      const { deleted } = await api("/api/admin/posts", { method: "DELETE", body: { ids: confirm.ids } });
      toast(deleted === 1 ? "Post deleted." : `${deleted} posts deleted.`);
      setConfirm(null);
      load(query);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  const allSelected = result.posts.length > 0 && result.posts.every((p) => selected.has(p.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(result.posts.map((p) => p.id)));
  const toggleOne = (id) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Filter by status" className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-card p-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={query.status === tab.value}
              onClick={() => update({ status: tab.value })}
              className={cn(
                "h-8 shrink-0 rounded-lg px-3 text-[13px] transition-colors",
                query.status === tab.value ? "bg-accent-soft font-medium text-fg" : "text-muted hover:text-fg",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 lg:w-72 lg:flex-none">
            <Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, tag, slug…"
              aria-label="Search posts"
              className={cn(inputClass, "h-10 pl-9")}
            />
          </div>
          <select
            value={query.sort}
            onChange={(e) => update({ sort: e.target.value })}
            aria-label="Sort posts"
            className={cn(inputClass, "h-10 w-auto pr-8")}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-accent-text/30 bg-accent-soft px-4 py-2.5">
          <p className="text-sm text-fg">
            {selected.size} selected
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSelected(new Set())} className={cn(buttonClass.ghost, "h-8")}>
              Clear
            </button>
            <button
              type="button"
              onClick={() => setConfirm({ ids: [...selected], label: `${selected.size} posts` })}
              className={cn(buttonClass.danger, "h-8 px-3")}
            >
              <Trash2 size={14} aria-hidden="true" /> Delete
            </button>
          </div>
        </div>
      )}

      <Card className="mt-4 overflow-hidden">
        {error ? (
          <p role="alert" className="px-5 py-10 text-center text-sm text-danger">
            {error}
          </p>
        ) : loading && !result.posts.length ? (
          <div className="flex items-center justify-center gap-3 px-5 py-16 text-sm text-muted">
            <Spinner /> Loading posts…
          </div>
        ) : !result.posts.length ? (
          <div className="px-5 py-16 text-center">
            <FileText size={28} aria-hidden="true" className="mx-auto text-subtle" />
            <p className="mt-3 text-sm font-medium text-fg">
              {query.q || query.status !== "all" ? "No posts match these filters" : "No posts yet"}
            </p>
            <Link href="/admin/posts/new" className={`${buttonClass.primary} mt-5`}>
              <PenSquare size={16} aria-hidden="true" /> New post
            </Link>
          </div>
        ) : (
          <div className={cn("overflow-x-auto transition-opacity", loading && "opacity-60")}>
            <table className="w-full min-w-[46rem] text-sm">
              <thead>
                <tr className="border-b border-line text-left font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
                  <th scope="col" className="py-3 pl-5 pr-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all posts on this page"
                      className="size-4 accent-[var(--accent)]"
                    />
                  </th>
                  <th scope="col" className="w-full py-3 pr-4 font-normal">Title</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Status</th>
                  <th scope="col" className="py-3 pr-4 text-right font-normal">Views</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Updated</th>
                  <th scope="col" className="py-3 pr-4 text-right font-normal">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {result.posts.map((post) => (
                  <tr key={post.id} className={cn("transition-colors hover:bg-card-hover", selected.has(post.id) && "bg-accent-soft")}>
                    <td className="py-3 pl-5 pr-3">
                      <input
                        type="checkbox"
                        checked={selected.has(post.id)}
                        onChange={() => toggleOne(post.id)}
                        aria-label={`Select ${post.title}`}
                        className="size-4 accent-[var(--accent)]"
                      />
                    </td>
                    <td className="max-w-0 py-3 pr-4">
                      <Link href={`/admin/posts/${post.id}`} className="flex items-center gap-2 font-medium text-fg hover:text-accent-text">
                        <span className="truncate">{post.title}</span>
                        {post.featured && <Star size={13} aria-label="Featured" className="shrink-0 fill-current text-accent-text" />}
                      </Link>
                      <p className="mt-0.5 flex items-center gap-2 truncate font-mono text-[11px] text-subtle">
                        /blog/{post.slug}
                        {post.tags?.length > 0 && <span className="truncate">· {post.tags.map((t) => `#${t}`).join(" ")}</span>}
                      </p>
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4">
                      <StatusBadge post={post} />
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-xs tabular-nums text-muted">
                      {post.views.toLocaleString("en-IN")}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 text-xs text-muted" title={new Date(post.updatedAt).toLocaleString()}>
                      {relativeTime(post.updatedAt)}
                    </td>
                    <td className="py-3 pr-3">
                      <RowMenu post={post} onAction={onAction} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {result.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-5 py-3">
            <p className="text-xs text-muted">
              {result.total} posts · page {result.page} of {result.totalPages}
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={result.page <= 1}
                onClick={() => setQuery((q) => ({ ...q, page: result.page - 1 }))}
                aria-label="Previous page"
                className={buttonClass.icon}
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled={result.page >= result.totalPages}
                onClick={() => setQuery((q) => ({ ...q, page: result.page + 1 }))}
                aria-label="Next page"
                className={buttonClass.icon}
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => !busy && setConfirm(null)}
        onConfirm={confirmDelete}
        busy={busy}
        title={`Delete ${confirm?.label ?? ""}?`}
        description="This permanently removes the post from the blog. It can't be undone."
      />
    </>
  );
}
