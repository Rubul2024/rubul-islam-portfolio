"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Columns2,
  ExternalLink,
  Eye,
  ImagePlus,
  Images,
  PencilLine,
  RotateCcw,
  Send,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Markdown from "@/components/blog/Markdown";
import MarkdownToolbar, { insertLink, wrap } from "@/components/admin/MarkdownToolbar";
import MediaLibrary, { uploadImage } from "@/components/admin/MediaLibrary";
import {
  Card,
  CharCount,
  ConfirmDialog,
  Dialog,
  Field,
  Spinner,
  StatusBadge,
  api,
  buttonClass,
  inputClass,
  relativeTime,
  useToast,
} from "@/components/admin/ui";
import { POST_LIMITS, countWords, postState, readingTime, slugify } from "@/lib/blog/utils";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const EMPTY_POST = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  tags: [],
  category: "",
  status: "draft",
  publishedAt: null,
  featured: false,
  coverImage: { url: "", alt: "" },
  seoTitle: "",
  seoDescription: "",
};

const EDITABLE = Object.keys(EMPTY_POST);

function pickEditable(post) {
  const out = {};
  for (const key of EDITABLE) out[key] = post?.[key] ?? EMPTY_POST[key];
  out.coverImage = { url: post?.coverImage?.url ?? "", alt: post?.coverImage?.alt ?? "" };
  return out;
}

/** ISO string ↔ value for <input type="datetime-local"> in the browser's timezone. */
function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value) {
  return value ? new Date(value).toISOString() : null;
}

// ── Tag input ────────────────────────────────────────────────

function TagInput({ id, tags, onChange, invalid }) {
  const [draft, setDraft] = useState("");

  function commit(raw = draft) {
    const next = raw
      .split(",")
      .map((t) => slugify(t))
      .filter((t) => t && !tags.includes(t));
    if (next.length) onChange([...tags, ...next].slice(0, POST_LIMITS.tags.max));
    setDraft("");
  }

  return (
    <div
      className={cn(
        "flex min-h-10 flex-wrap items-center gap-1.5 rounded-xl border bg-bg px-2 py-1.5 focus-within:border-accent-text/60 focus-within:ring-2 focus-within:ring-accent/20",
        invalid ? "border-danger/60" : "border-line",
      )}
    >
      {tags.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-0.5 font-mono text-xs text-accent-text">
          #{tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            aria-label={`Remove tag ${tag}`}
            className="text-accent-text/70 hover:text-fg"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => (e.target.value.includes(",") ? commit(e.target.value) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !draft && tags.length) {
            onChange(tags.slice(0, -1));
          }
        }}
        onBlur={() => draft && commit()}
        placeholder={tags.length ? "" : "react, nodejs…"}
        disabled={tags.length >= POST_LIMITS.tags.max}
        className="h-7 min-w-24 flex-1 bg-transparent px-1 text-sm text-fg placeholder:text-subtle focus:outline-none"
      />
    </div>
  );
}

// ── Sidebar panel ────────────────────────────────────────────

function Panel({ title, children, action }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">{title}</h2>
        {action}
      </div>
      <div className="grid grid-cols-1 gap-4">{children}</div>
    </Card>
  );
}

// ── Editor ───────────────────────────────────────────────────

export default function PostEditor({ post: initialPost }) {
  const router = useRouter();
  const toast = useToast();
  const isNew = !initialPost;

  const [saved, setSaved] = useState(() => pickEditable(initialPost)); // last saved version
  const [form, setForm] = useState(() => pickEditable(initialPost));
  const [meta, setMeta] = useState({
    id: initialPost?.id ?? null,
    updatedAt: initialPost?.updatedAt ?? null,
    views: initialPost?.views ?? 0,
  });
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(null); // "draft" | "publish" | null
  const [view, setView] = useState("split"); // "write" | "split" | "preview"
  const [picker, setPicker] = useState(null); // "cover" | "content" | null
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [backup, setBackup] = useState(null);
  const [, setTick] = useState(0);

  const textareaRef = useRef(null);
  const coverInputRef = useRef(null);
  const backupKey = `post-backup:${meta.id ?? "new"}`;

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
  const deferredContent = useDeferredValue(form.content);
  const words = useMemo(() => countWords(form.content), [form.content]);
  const state = postState({ status: form.status, publishedAt: form.publishedAt });
  const isFutureDate = form.publishedAt && new Date(form.publishedAt).getTime() > Date.now();

  const set = useCallback((field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
  }, []);

  // Re-render every 30s so "Saved 2 minutes ago" stays current.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  // Offer to restore an unsaved local backup from a previous session.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(backupKey);
      if (!raw) return;
      const stored = JSON.parse(raw);
      const newer = !meta.updatedAt || new Date(stored.savedAt) > new Date(meta.updatedAt);
      // Reading browser storage is only possible after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (newer && JSON.stringify(stored.form) !== JSON.stringify(saved)) setBackup(stored);
      else localStorage.removeItem(backupKey);
    } catch {
      /* storage unavailable */
    }
    // Only on first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep a local backup of unsaved work (debounced).
  useEffect(() => {
    if (!dirty || backup) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(backupKey, JSON.stringify({ form, savedAt: new Date().toISOString() }));
      } catch {
        /* storage unavailable */
      }
    }, 800);
    return () => clearTimeout(t);
  }, [form, dirty, backup, backupKey]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Auto-fill the slug from the title until it's edited by hand.
  function onTitleChange(value) {
    setForm((f) => ({ ...f, title: value, ...(slugTouched ? {} : { slug: slugify(value) }) }));
    setErrors((e) => ({ ...e, title: undefined, slug: undefined }));
  }

  const save = useCallback(
    async (intent) => {
      if (saving) return;
      const status = intent === "publish" ? "published" : intent === "unpublish" ? "draft" : form.status;
      const payload = { ...form, status };
      setSaving(intent === "publish" ? "publish" : "draft");
      try {
        const { post } = await api(isNew && !meta.id ? "/api/admin/posts" : `/api/admin/posts/${meta.id}`, {
          method: isNew && !meta.id ? "POST" : "PUT",
          body: payload,
        });
        const next = pickEditable(post);
        setForm(next);
        setSaved(next);
        setMeta({ id: post.id, updatedAt: post.updatedAt, views: post.views });
        setErrors({});
        setSlugTouched(true);
        try {
          localStorage.removeItem(backupKey);
          localStorage.removeItem("post-backup:new");
        } catch {
          /* ignore */
        }

        const nowState = postState(post);
        toast(
          intent === "publish"
            ? nowState === "scheduled"
              ? `Scheduled for ${new Date(post.publishedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}.`
              : saved.status === "published"
                ? "Changes are live."
                : "Published! Your post is live."
            : intent === "unpublish"
              ? "Moved to drafts. The post is no longer public."
              : "Draft saved.",
        );
        if (isNew && !meta.id) router.replace(`/admin/posts/${post.id}`);
      } catch (err) {
        if (err.errors) setErrors(err.errors);
        toast(err.message, "error");
      } finally {
        setSaving(null);
      }
    },
    [form, saving, isNew, meta.id, backupKey, router, saved.status, toast],
  );

  // Keyboard shortcuts: Ctrl/Cmd+S saves, Ctrl/Cmd+Shift+P toggles preview.
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save(form.status === "published" ? "publish" : "draft");
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setView((v) => (v === "preview" ? "split" : "preview"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, form.status]);

  function onEditorKeyDown(e) {
    const t = e.currentTarget;
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === "b") {
      e.preventDefault();
      wrap(t, "**");
    } else if (mod && e.key.toLowerCase() === "i") {
      e.preventDefault();
      wrap(t, "_");
    } else if (mod && e.key.toLowerCase() === "k") {
      e.preventDefault();
      insertLink(t);
    } else if (e.key === "Tab" && !e.shiftKey && t.selectionStart === t.selectionEnd) {
      e.preventDefault();
      document.execCommand("insertText", false, "  ");
    }
  }

  async function insertUploadedImages(files) {
    const images = [...files].filter((f) => f.type.startsWith("image/"));
    if (!images.length) return false;
    toast(`Uploading ${images.length === 1 ? "image" : `${images.length} images`}…`, "info");
    for (const file of images) {
      try {
        const item = await uploadImage(file);
        insertImageMarkdown(item.url, file.name.replace(/\.\w+$/, ""));
      } catch (err) {
        toast(err.message, "error");
      }
    }
    return true;
  }

  function insertImageMarkdown(url, alt = "") {
    const t = textareaRef.current;
    if (!t) return set("content", `${form.content}\n\n![${alt}](${url})\n`);
    t.focus();
    const md = `![${alt}](${url})`;
    if (!document.execCommand("insertText", false, md)) {
      t.setRangeText(md, t.selectionStart, t.selectionEnd, "end");
      t.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  async function uploadCover(file) {
    if (!file) return;
    try {
      const item = await uploadImage(file);
      set("coverImage", { ...form.coverImage, url: item.url });
      toast("Cover image uploaded.");
    } catch (err) {
      toast(err.message, "error");
    }
  }

  async function onDelete() {
    setDeleting(true);
    try {
      await api(`/api/admin/posts/${meta.id}`, { method: "DELETE" });
      try {
        localStorage.removeItem(backupKey);
      } catch {
        /* ignore */
      }
      setSaved(form); // suppress the unsaved-changes prompt
      toast("Post deleted.");
      router.push("/admin/posts");
    } catch (err) {
      toast(err.message, "error");
      setDeleting(false);
    }
  }

  const publishLabel =
    saved.status === "published" && form.status === "published" ? "Update" : isFutureDate ? "Schedule" : "Publish";
  const seoTitle = form.seoTitle || form.title || "Post title";
  const seoDescription = form.seoDescription || form.excerpt || "The excerpt or meta description appears here in search results.";

  return (
    <div className="pb-16">
      {/* ── Top bar ── */}
      <div className="sticky top-14 z-30 -mx-4 mb-6 border-b border-line bg-bg/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:-mt-10 lg:px-10">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/posts" className={cn(buttonClass.ghost, "px-2")} aria-label="Back to posts">
            <ArrowLeft size={17} aria-hidden="true" />
          </Link>
          <div className="flex min-w-0 items-center gap-3">
            <StatusBadge post={{ status: saved.status, publishedAt: saved.publishedAt }} />
            <p className="truncate text-xs text-muted" aria-live="polite">
              {saving ? "Saving…" : dirty ? "Unsaved changes" : meta.updatedAt ? `Saved ${relativeTime(meta.updatedAt)}` : "New post"}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div role="group" aria-label="Editor layout" className="hidden rounded-xl border border-line bg-card p-0.5 md:flex">
              {[
                { key: "write", label: "Write", icon: PencilLine },
                { key: "split", label: "Split", icon: Columns2 },
                { key: "preview", label: "Preview", icon: Eye },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  aria-pressed={view === key}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-[10px] px-2.5 text-xs transition-colors",
                    view === key ? "bg-accent-soft text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  <Icon size={14} aria-hidden="true" /> {label}
                </button>
              ))}
            </div>

            {saved.status === "published" ? (
              <button type="button" onClick={() => save("unpublish")} disabled={Boolean(saving)} className={cn(buttonClass.secondary, "h-9")}>
                Unpublish
              </button>
            ) : (
              <button type="button" onClick={() => save("draft")} disabled={Boolean(saving)} className={cn(buttonClass.secondary, "h-9")}>
                {saving === "draft" && <Spinner size={14} />} Save draft
              </button>
            )}
            <button type="button" onClick={() => save("publish")} disabled={Boolean(saving)} className={cn(buttonClass.primary, "h-9")}>
              {saving === "publish" ? <Spinner size={14} /> : isFutureDate ? <CalendarClock size={15} aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
              {publishLabel}
            </button>
          </div>
        </div>
      </div>

      {backup && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-blue/30 bg-blue/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-fg">
            <strong className="font-semibold">Unsaved changes found</strong> from {relativeTime(backup.savedAt)}. Restore them?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem(backupKey);
                } catch {
                  /* ignore */
                }
                setBackup(null);
              }}
              className={cn(buttonClass.ghost, "h-9")}
            >
              Discard
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(pickEditable(backup.form));
                setBackup(null);
              }}
              className={cn(buttonClass.primary, "h-9")}
            >
              <RotateCcw size={15} aria-hidden="true" /> Restore
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* ── Main column ── */}
        <div className="min-w-0">
          <label htmlFor="title" className="sr-only">
            Title
          </label>
          <textarea
            id="title"
            rows={1}
            value={form.title}
            onChange={(e) => onTitleChange(e.target.value.replace(/\n/g, " "))}
            placeholder="Post title"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
            className="field-sizing-content w-full resize-none bg-transparent text-3xl font-semibold leading-tight tracking-tight text-fg placeholder:text-subtle/60 focus:outline-none sm:text-4xl"
          />
          {errors.title && (
            <p id="title-error" className="mt-1 text-xs text-danger">
              {errors.title}
            </p>
          )}

          <Card className="mt-5 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-bg-2 px-2 py-1.5">
              {view !== "preview" ? (
                <MarkdownToolbar textareaRef={textareaRef} onImage={() => setPicker("content")} />
              ) : (
                <p className="px-2 text-xs text-muted">Preview — exactly how readers will see it</p>
              )}
              {/* Mobile layout toggle */}
              <button
                type="button"
                onClick={() => setView((v) => (v === "preview" ? "write" : "preview"))}
                className={cn(buttonClass.ghost, "h-8 text-xs md:hidden")}
              >
                {view === "preview" ? <PencilLine size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                {view === "preview" ? "Write" : "Preview"}
              </button>
            </div>

            <div className={cn("grid", view === "split" && "md:grid-cols-2")}>
              <div className={cn(view === "preview" && "hidden", view === "split" && "md:border-r md:border-line")}>
                <label htmlFor="content" className="sr-only">
                  Content (Markdown)
                </label>
                <textarea
                  ref={textareaRef}
                  id="content"
                  value={form.content}
                  onChange={(e) => set("content", e.target.value)}
                  onKeyDown={onEditorKeyDown}
                  onPaste={async (e) => {
                    if (e.clipboardData.files.length) {
                      e.preventDefault();
                      await insertUploadedImages(e.clipboardData.files);
                    }
                  }}
                  onDrop={async (e) => {
                    if (e.dataTransfer.files.length) {
                      e.preventDefault();
                      await insertUploadedImages(e.dataTransfer.files);
                    }
                  }}
                  spellCheck
                  placeholder={"Start writing in Markdown…\n\n## A heading\n\nParagraphs, **bold**, `code`, lists and links.\n\nPaste or drop images straight in."}
                  aria-invalid={Boolean(errors.content)}
                  className="block h-[calc(100dvh-17rem)] min-h-[28rem] w-full resize-none bg-card p-5 font-mono text-[13.5px] leading-7 text-fg placeholder:text-subtle focus:outline-none"
                />
              </div>
              {view !== "write" && (
                <div
                  className={cn(
                    "h-[calc(100dvh-17rem)] min-h-[28rem] overflow-y-auto bg-bg p-6 sm:p-8",
                    view === "split" && "hidden md:block",
                  )}
                >
                  {form.title && <h1 className="mb-6 text-3xl font-semibold leading-tight tracking-tight text-fg">{form.title}</h1>}
                  {deferredContent.trim() ? (
                    <Markdown>{deferredContent}</Markdown>
                  ) : (
                    <p className="text-sm text-subtle">Nothing to preview yet.</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-bg-2 px-4 py-2 font-mono text-[11px] text-subtle">
              <span>
                {words.toLocaleString("en-IN")} words · {readingTime(form.content)} min read
              </span>
              <span className="hidden sm:inline">Ctrl+S save · Ctrl+B bold · Ctrl+K link · Ctrl+Shift+P preview</span>
            </div>
          </Card>
          {errors.content && <p className="mt-2 text-xs text-danger">{errors.content}</p>}
        </div>

        {/* ── Sidebar ── */}
        <div className="grid grid-cols-1 content-start gap-4">
          <Panel title="Publishing">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Status</span>
              <StatusBadge post={{ status: form.status, publishedAt: form.publishedAt }} />
            </div>
            <Field
              label="Publish date"
              htmlFor="publishedAt"
              error={errors.publishedAt}
              hint={isFutureDate ? "In the future — the post goes live automatically then." : "Leave empty to publish immediately."}
            >
              <div className="flex gap-2">
                <input
                  id="publishedAt"
                  type="datetime-local"
                  value={toLocalInput(form.publishedAt)}
                  onChange={(e) => set("publishedAt", fromLocalInput(e.target.value))}
                  className={cn(inputClass, "h-10")}
                />
                {form.publishedAt && (
                  <button type="button" onClick={() => set("publishedAt", null)} aria-label="Clear date" className={buttonClass.icon}>
                    <X size={15} aria-hidden="true" />
                  </button>
                )}
              </div>
            </Field>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-3">
              <span className="flex items-center gap-2.5 text-sm text-fg">
                <Star size={16} aria-hidden="true" className={form.featured ? "fill-current text-accent-text" : "text-subtle"} />
                Feature on the blog
              </span>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
            </label>
            {state === "published" && saved.status === "published" && (
              <a
                href={`/blog/${saved.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-accent-text hover:underline"
              >
                <ExternalLink size={14} aria-hidden="true" /> View live post
                {meta.views > 0 && <span className="text-subtle">· {meta.views} views</span>}
              </a>
            )}
          </Panel>

          <Panel title="Permalink">
            <Field
              label="Slug"
              htmlFor="slug"
              error={errors.slug}
              hint={
                saved.status === "published" && form.slug !== saved.slug
                  ? "Changing the slug of a live post breaks existing links to it."
                  : `${site.url.replace(/^https?:\/\//, "")}/blog/${form.slug || "your-post"}`
              }
            >
              <input
                id="slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                }}
                onBlur={() => set("slug", slugify(form.slug || form.title))}
                aria-invalid={Boolean(errors.slug)}
                className={cn(inputClass, "h-10 font-mono text-[13px]")}
              />
            </Field>
          </Panel>

          <Panel title="Summary">
            <Field
              label="Excerpt"
              htmlFor="excerpt"
              error={errors.excerpt}
              hint="Shown on cards and as the default meta description. Leave empty to generate one."
              counter={<CharCount value={form.excerpt} max={POST_LIMITS.excerpt.max} />}
            >
              <textarea
                id="excerpt"
                rows={3}
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                aria-invalid={Boolean(errors.excerpt)}
                className={cn(inputClass, "resize-y py-2.5 leading-relaxed")}
              />
            </Field>
            <Field label="Category" htmlFor="category" error={errors.category} hint="e.g. Tutorial, Case study, Notes">
              <input
                id="category"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                list="category-options"
                className={cn(inputClass, "h-10")}
              />
              <datalist id="category-options">
                {["Tutorial", "Guide", "Case study", "Notes", "Opinion", "Career"].map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field
              label="Tags"
              htmlFor="tags"
              error={errors.tags}
              hint="Press Enter or comma to add."
              counter={<span className="font-mono text-[11px] text-subtle">{form.tags.length}/{POST_LIMITS.tags.max}</span>}
            >
              <TagInput id="tags" tags={form.tags} onChange={(tags) => set("tags", tags)} invalid={Boolean(errors.tags)} />
            </Field>
          </Panel>

          <Panel
            title="Cover image"
            action={
              form.coverImage.url && (
                <button
                  type="button"
                  onClick={() => set("coverImage", { url: "", alt: "" })}
                  className="inline-flex items-center gap-1 text-xs text-muted hover:text-danger"
                >
                  <Trash2 size={13} aria-hidden="true" /> Remove
                </button>
              )
            }
          >
            {form.coverImage.url ? (
              <div className="overflow-hidden rounded-xl border border-line bg-bg-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                <img src={form.coverImage.url} alt="" className="aspect-[2/1] w-full object-cover" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => coverInputRef.current?.click()} className={cn(buttonClass.secondary, "h-20 flex-col gap-1 text-xs")}>
                  <ImagePlus size={18} aria-hidden="true" /> Upload
                </button>
                <button type="button" onClick={() => setPicker("cover")} className={cn(buttonClass.secondary, "h-20 flex-col gap-1 text-xs")}>
                  <Images size={18} aria-hidden="true" /> Library
                </button>
              </div>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              hidden
              onChange={(e) => {
                uploadCover(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            {form.coverImage.url ? (
              <Field label="Alt text" htmlFor="cover-alt" hint="Describe the image for screen readers.">
                <input
                  id="cover-alt"
                  value={form.coverImage.alt}
                  onChange={(e) => set("coverImage", { ...form.coverImage, alt: e.target.value })}
                  className={cn(inputClass, "h-10")}
                />
              </Field>
            ) : (
              <Field label="…or image URL" htmlFor="cover-url" error={errors.coverImage}>
                <input
                  id="cover-url"
                  type="url"
                  placeholder="https://"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      set("coverImage", { url: e.currentTarget.value.trim(), alt: "" });
                    }
                  }}
                  onBlur={(e) => e.target.value.trim() && set("coverImage", { url: e.target.value.trim(), alt: "" })}
                  className={cn(inputClass, "h-10")}
                />
              </Field>
            )}
          </Panel>

          <Panel title="Search & social">
            <div className="rounded-xl border border-line bg-bg p-3.5" aria-label="Search result preview">
              <p className="truncate text-xs text-subtle">
                {site.url.replace(/^https?:\/\//, "")} › blog › {form.slug || "your-post"}
              </p>
              <p className="mt-1 line-clamp-1 text-[15px] text-blue">{seoTitle}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{seoDescription}</p>
            </div>
            <Field
              label="SEO title"
              htmlFor="seoTitle"
              error={errors.seoTitle}
              hint="Defaults to the post title."
              counter={<CharCount value={form.seoTitle} max={POST_LIMITS.seoTitle.max} />}
            >
              <input
                id="seoTitle"
                value={form.seoTitle}
                onChange={(e) => set("seoTitle", e.target.value)}
                className={cn(inputClass, "h-10")}
              />
            </Field>
            <Field
              label="Meta description"
              htmlFor="seoDescription"
              error={errors.seoDescription}
              hint="Defaults to the excerpt."
              counter={<CharCount value={form.seoDescription} max={POST_LIMITS.seoDescription.max} />}
            >
              <textarea
                id="seoDescription"
                rows={3}
                value={form.seoDescription}
                onChange={(e) => set("seoDescription", e.target.value)}
                className={cn(inputClass, "resize-y py-2.5 leading-relaxed")}
              />
            </Field>
          </Panel>

          {meta.id && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className={cn(buttonClass.ghost, "justify-start text-danger hover:text-danger")}
            >
              <Trash2 size={16} aria-hidden="true" /> Delete post
            </button>
          )}
        </div>
      </div>

      <Dialog
        open={Boolean(picker)}
        onClose={() => setPicker(null)}
        title={picker === "cover" ? "Choose a cover image" : "Insert an image"}
        className="max-w-3xl"
      >
        <div className="mt-5 max-h-[65dvh] overflow-y-auto pr-1">
          <MediaLibrary
            mode="pick"
            onPick={(item) => {
              if (picker === "cover") set("coverImage", { url: item.url, alt: form.coverImage.alt });
              else insertImageMarkdown(item.url, item.filename.replace(/\.\w+$/, ""));
              setPicker(null);
            }}
          />
        </div>
        <div className="mt-5 flex justify-end">
          <button type="button" onClick={() => setPicker(null)} className={buttonClass.secondary}>
            Cancel
          </button>
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => !deleting && setConfirmDelete(false)}
        onConfirm={onDelete}
        busy={deleting}
        title="Delete this post?"
        description="It will be removed from the blog permanently. This can't be undone."
      />
    </div>
  );
}
