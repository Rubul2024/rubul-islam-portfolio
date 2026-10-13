"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Inbox,
  Mail,
  MailOpen,
  MessageCircle,
  Phone,
  Reply,
  Search,
  Trash2,
} from "lucide-react";
import { Card, ConfirmDialog, Spinner, api, buttonClass, inputClass, relativeTime, useToast } from "@/components/admin/ui";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "inbox", label: "Inbox" },
  { value: "new", label: "New" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
];

const STATUS_STYLES = {
  new: "border-accent-text/30 bg-accent-soft text-accent-text",
  read: "border-line-strong bg-bg-2 text-muted",
  replied: "border-success/30 bg-success/10 text-success",
  archived: "border-line bg-bg-2 text-subtle",
};

function StatusPill({ status }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] capitalize leading-4", STATUS_STYLES[status])}>
      {status}
    </span>
  );
}

/** wa.me needs the full international number; 10-digit numbers are assumed Indian (+91). */
function whatsappHref(phone) {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) digits = `91${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

function replyHref(message) {
  const first = message.name.split(" ")[0];
  const subject = `Re: ${message.projectType}`;
  const quoted = message.message
    .split("\n")
    .map((l) => `> ${l}`)
    .join("\n");
  const body = `Hi ${first},\n\nThanks for getting in touch about your project.\n\n\n\nBest regards,\n${site.name}\n${site.phoneDisplay}\n\n---\nOn ${new Date(message.createdAt).toLocaleString("en-IN")}, ${message.name} wrote:\n${quoted}`;
  return `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function MessageDetail({ message, onUpdate, onDelete, onBack }) {
  const [notes, setNotes] = useState(message.notes || "");
  const [copied, setCopied] = useState(null);

  async function copy(text, key) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      window.prompt("Copy:", text);
    }
  }

  async function saveNotes() {
    if (notes === (message.notes || "")) return;
    await onUpdate(message.id, { notes }, "Notes saved.");
  }

  return (
    <article className="flex h-full flex-col">
      <header className="border-b border-line p-5 sm:p-6">
        <button type="button" onClick={onBack} className={cn(buttonClass.ghost, "-ml-2 mb-3 h-8 px-2 text-xs lg:hidden")}>
          <ArrowLeft size={14} aria-hidden="true" /> All messages
        </button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight text-fg">{message.name}</h2>
            <p className="mt-1 text-sm text-muted">
              {message.projectType} · {new Date(message.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </p>
            {(message.budget || message.timeline) && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {message.budget && (
                  <span className="rounded-full border border-line bg-bg px-2.5 py-1 text-xs text-muted">
                    Budget: <span className="text-fg">{message.budget}</span>
                  </span>
                )}
                {message.timeline && (
                  <span className="rounded-full border border-line bg-bg px-2.5 py-1 text-xs text-muted">
                    Timeline: <span className="text-fg">{message.timeline}</span>
                  </span>
                )}
              </div>
            )}
          </div>
          <StatusPill status={message.status} />
        </div>

        {/* Contact details */}
        <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex min-w-0 items-center gap-2 rounded-xl border border-line bg-bg px-3 py-2.5">
            <Mail size={15} aria-hidden="true" className="shrink-0 text-subtle" />
            <dt className="sr-only">Email</dt>
            <dd className="min-w-0 flex-1 truncate">
              <a href={`mailto:${message.email}`} className="text-fg hover:text-accent-text">
                {message.email}
              </a>
            </dd>
            <button
              type="button"
              onClick={() => copy(message.email, "email")}
              aria-label="Copy email"
              className="text-subtle hover:text-fg"
            >
              {copied === "email" ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
            </button>
          </div>
          {message.phone ? (
            <div className="flex min-w-0 items-center gap-2 rounded-xl border border-line bg-bg px-3 py-2.5">
              <Phone size={15} aria-hidden="true" className="shrink-0 text-subtle" />
              <dt className="sr-only">Phone</dt>
              <dd className="min-w-0 flex-1 truncate">
                <a href={`tel:${message.phone.replace(/[^\d+]/g, "")}`} className="text-fg hover:text-accent-text">
                  {message.phone}
                </a>
              </dd>
              <button
                type="button"
                onClick={() => copy(message.phone, "phone")}
                aria-label="Copy phone number"
                className="text-subtle hover:text-fg"
              >
                {copied === "phone" ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-line px-3 py-2.5 text-subtle">
              <Phone size={15} aria-hidden="true" /> No phone given
            </div>
          )}
        </dl>

        {/* Primary actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={replyHref(message)}
            onClick={() => message.status !== "replied" && onUpdate(message.id, { status: "replied" })}
            className={cn(buttonClass.primary, "h-9")}
          >
            <Reply size={15} aria-hidden="true" /> Reply by email
          </a>
          {message.phone && (
            <>
              <a
                href={whatsappHref(message.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonClass.secondary, "h-9")}
              >
                <MessageCircle size={15} aria-hidden="true" /> WhatsApp
              </a>
              <a href={`tel:${message.phone.replace(/[^\d+]/g, "")}`} className={cn(buttonClass.secondary, "h-9")}>
                <Phone size={15} aria-hidden="true" /> Call
              </a>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5 sm:p-6">
        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-fg">{message.message}</p>

        <div className="mt-8">
          <label htmlFor="message-notes" className="text-[13px] font-medium text-fg">
            Private notes
          </label>
          <textarea
            id="message-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            placeholder="Follow-up date, budget, what you discussed… (only you can see this)"
            className={cn(inputClass, "mt-1.5 resize-y py-2.5 leading-relaxed")}
          />
        </div>
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-line p-4">
        {message.status === "replied" ? (
          <button type="button" onClick={() => onUpdate(message.id, { status: "read" }, "Marked as not replied.")} className={cn(buttonClass.ghost, "h-9")}>
            <MailOpen size={15} aria-hidden="true" /> Mark as not replied
          </button>
        ) : (
          <button type="button" onClick={() => onUpdate(message.id, { status: "replied" }, "Marked as replied.")} className={cn(buttonClass.ghost, "h-9")}>
            <Check size={15} aria-hidden="true" /> Mark as replied
          </button>
        )}
        {message.status !== "new" && message.status !== "archived" && (
          <button type="button" onClick={() => onUpdate(message.id, { status: "new" }, "Marked as unread.")} className={cn(buttonClass.ghost, "h-9")}>
            <Mail size={15} aria-hidden="true" /> Mark unread
          </button>
        )}
        {message.status === "archived" ? (
          <button type="button" onClick={() => onUpdate(message.id, { status: "read" }, "Moved to inbox.")} className={cn(buttonClass.ghost, "h-9")}>
            <ArchiveRestore size={15} aria-hidden="true" /> Move to inbox
          </button>
        ) : (
          <button type="button" onClick={() => onUpdate(message.id, { status: "archived" }, "Archived.")} className={cn(buttonClass.ghost, "h-9")}>
            <Archive size={15} aria-hidden="true" /> Archive
          </button>
        )}
        <button type="button" onClick={() => onDelete(message)} className={cn(buttonClass.ghost, "ml-auto h-9 text-danger hover:text-danger")}>
          <Trash2 size={15} aria-hidden="true" /> Delete
        </button>
      </footer>
    </article>
  );
}

export default function MessagesInbox({ initialOpen }) {
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState({ status: "inbox", q: "", page: 1 });
  const [search, setSearch] = useState("");
  const [data, setData] = useState({ messages: [], total: 0, page: 1, totalPages: 1, counts: null });
  const [loadedKey, setLoadedKey] = useState(null);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(initialOpen || null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [linked, setLinked] = useState(null); // a ?open= message that isn't on the current page
  const autoRead = useRef(new Set());

  const load = useCallback(async (q, signal) => {
    try {
      const params = new URLSearchParams({ status: q.status, q: q.q, page: String(q.page) });
      const result = await api(`/api/admin/messages?${params}`, { signal });
      setData(result);
      setError("");
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message);
    }
    setLoadedKey(JSON.stringify(q));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // State is only set after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(query, controller.signal);
    return () => controller.abort();
  }, [query, load]);

  // Debounced search
  useEffect(() => {
    if (search === query.q) return;
    const t = setTimeout(() => setQuery((q) => ({ ...q, q: search.trim(), page: 1 })), 300);
    return () => clearTimeout(t);
  }, [search, query.q]);

  const loading = loadedKey !== JSON.stringify(query);
  const open = data.messages.find((m) => m.id === openId) ?? (linked?.id === openId ? linked : null);

  // A linked message (e.g. from the notification email) may be on another page: fetch it directly.
  useEffect(() => {
    if (!openId || loading || data.messages.some((m) => m.id === openId) || linked?.id === openId) return;
    let cancelled = false;
    api(`/api/admin/messages/${openId}`)
      .then(({ message }) => !cancelled && setLinked(message))
      .catch(() => !cancelled && setOpenId(null));
    return () => {
      cancelled = true;
    };
  }, [openId, loading, data.messages, linked]);

  const update = useCallback(
    async (id, patch, successText) => {
      try {
        const { message } = await api(`/api/admin/messages/${id}`, { method: "PATCH", body: patch });
        setData((d) => ({ ...d, messages: d.messages.map((m) => (m.id === id ? message : m)) }));
        setLinked((l) => (l?.id === id ? message : l));
        if (successText) toast(successText);
        if (patch.status) {
          load(query);
          router.refresh(); // update the unread badge in the sidebar
        }
      } catch (err) {
        toast(err.message, "error");
      }
    },
    [load, query, router, toast],
  );

  // Opening a new message marks it as read (once).
  useEffect(() => {
    if (open?.status === "new" && !autoRead.current.has(open.id)) {
      autoRead.current.add(open.id);
      update(open.id, { status: "read" });
    }
  }, [open, update]);

  // Keep ?open= in the URL so a message can be linked to (e.g. from the notification email).
  useEffect(() => {
    window.history.replaceState(null, "", openId ? `/admin/messages?open=${openId}` : "/admin/messages");
  }, [openId]);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await api(`/api/admin/messages/${toDelete.id}`, { method: "DELETE" });
      toast("Message deleted.");
      if (openId === toDelete.id) setOpenId(null);
      setToDelete(null);
      load(query);
      router.refresh();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setDeleting(false);
    }
  }

  const counts = data.counts;

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Filter messages" className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-card p-1">
          {TABS.map((tab) => {
            const count = counts?.[tab.value];
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={query.status === tab.value}
                onClick={() => setQuery((q) => ({ ...q, status: tab.value, page: 1 }))}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-2 rounded-lg px-3 text-[13px] transition-colors",
                  query.status === tab.value ? "bg-accent-soft font-medium text-fg" : "text-muted hover:text-fg",
                )}
              >
                {tab.label}
                {count > 0 && <span className="font-mono text-[11px] text-subtle">{count}</span>}
              </button>
            );
          })}
        </div>
        <div className="relative lg:w-80">
          <Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, message…"
            aria-label="Search messages"
            className={cn(inputClass, "h-10 pl-9")}
          />
        </div>
      </div>

      <Card className="mt-4 grid min-h-[34rem] grid-cols-1 overflow-hidden lg:h-[calc(100dvh-14rem)] lg:grid-cols-[22rem_minmax(0,1fr)]">
        {/* List */}
        <div className={cn("flex min-h-0 flex-col border-line lg:border-r", open && "hidden lg:flex")}>
          {error ? (
            <p role="alert" className="p-6 text-center text-sm text-danger">
              {error}
            </p>
          ) : loading && !data.messages.length ? (
            <div className="flex items-center justify-center gap-3 p-12 text-sm text-muted">
              <Spinner /> Loading messages…
            </div>
          ) : !data.messages.length ? (
            <div className="p-12 text-center">
              <Inbox size={28} aria-hidden="true" className="mx-auto text-subtle" />
              <p className="mt-3 text-sm font-medium text-fg">{query.q ? "No messages match" : "No messages here"}</p>
              <p className="mt-1 text-sm text-muted">Enquiries from the contact form land here.</p>
            </div>
          ) : (
            <ul className={cn("min-h-0 flex-1 divide-y divide-line overflow-y-auto transition-opacity", loading && "opacity-60")}>
              {data.messages.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(m.id)}
                    aria-current={openId === m.id ? "true" : undefined}
                    className={cn(
                      "block w-full px-4 py-3.5 text-left transition-colors hover:bg-card-hover",
                      openId === m.id && "bg-accent-soft",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {m.status === "new" && <span aria-label="Unread" className="size-2 shrink-0 rounded-full bg-accent" />}
                      <span className={cn("min-w-0 flex-1 truncate text-sm", m.status === "new" ? "font-semibold text-fg" : "text-fg/90")}>
                        {m.name}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-subtle">{relativeTime(m.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-accent-text">{m.projectType}</p>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted">{m.message}</p>
                    {m.status !== "new" && (
                      <div className="mt-2">
                        <StatusPill status={m.status} />
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
              <span className="text-xs text-muted">
                Page {data.page} of {data.totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={data.page <= 1}
                  onClick={() => setQuery((q) => ({ ...q, page: data.page - 1 }))}
                  aria-label="Previous page"
                  className={buttonClass.icon}
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={data.page >= data.totalPages}
                  onClick={() => setQuery((q) => ({ ...q, page: data.page + 1 }))}
                  aria-label="Next page"
                  className={buttonClass.icon}
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail */}
        <div className={cn("min-h-0", !open && "hidden lg:block")}>
          {open ? (
            <MessageDetail
              key={open.id}
              message={open}
              onUpdate={update}
              onDelete={setToDelete}
              onBack={() => setOpenId(null)}
            />
          ) : (
            <div className="grid h-full place-items-center p-12 text-center">
              <div>
                <MailOpen size={30} aria-hidden="true" className="mx-auto text-subtle" />
                <p className="mt-3 text-sm text-muted">Select a message to read it and reply.</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => !deleting && setToDelete(null)}
        onConfirm={confirmDelete}
        busy={deleting}
        title="Delete this message?"
        description={`The enquiry from ${toDelete?.name ?? ""} will be removed permanently. Archive it instead if you might need it later.`}
      />
    </>
  );
}
