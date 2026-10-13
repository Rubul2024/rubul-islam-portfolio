"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { ConfirmDialog, Spinner, api, buttonClass, formatBytes, relativeTime, useToast } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";
const MAX_BYTES = 4 * 1024 * 1024;

/** Uploads one image to the media library and returns the stored item. */
export async function uploadImage(file) {
  if (file.size > MAX_BYTES) throw new Error(`${file.name} is larger than 4 MB.`);
  const body = new FormData();
  body.append("file", file);
  const { item } = await api("/api/admin/media", { method: "POST", body });
  return item;
}

/**
 * Grid of uploaded images.
 * mode="manage" — copy links and delete (the Media page)
 * mode="pick"   — click an image to choose it (editor dialogs)
 */
export default function MediaLibrary({ mode = "manage", onPick }) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef(null);

  const load = useCallback(
    async (before) => {
      try {
        const { items: page } = await api(`/api/admin/media${before ? `?before=${before}` : ""}`);
        setItems((list) => (before ? [...list, ...page] : page));
        setHasMore(page.length === 60);
      } catch (err) {
        toast(err.message, "error");
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    // State is only set after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function upload(files) {
    const images = [...files].filter((f) => f.type.startsWith("image/"));
    if (!images.length) return;
    setUploading(images.length);
    for (const file of images) {
      try {
        const item = await uploadImage(file);
        setItems((list) => [item, ...list]);
      } catch (err) {
        toast(err.message, "error");
      }
      setUploading((n) => n - 1);
    }
    toast(images.length === 1 ? "Image uploaded." : `${images.length} images processed.`);
  }

  async function copy(item, kind) {
    const text = kind === "md" ? `![${item.filename.replace(/\.\w+$/, "")}](${item.url})` : `${window.location.origin}${item.url}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(`${item.id}-${kind}`);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      window.prompt("Copy:", text);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await api(`/api/admin/media/${toDelete.id}`, { method: "DELETE" });
      setItems((list) => list.filter((i) => i.id !== toDelete.id));
      toast("Image deleted.");
      setToDelete(null);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragging ? "border-accent bg-accent-soft" : "border-line-strong",
        )}
      >
        {uploading > 0 ? (
          <p className="flex items-center gap-3 text-sm text-muted">
            <Spinner /> Uploading {uploading} {uploading === 1 ? "image" : "images"}…
          </p>
        ) : (
          <>
            <UploadCloud size={26} aria-hidden="true" className="text-subtle" />
            <p className="mt-3 text-sm text-fg">Drag images here, or</p>
            <button type="button" onClick={() => inputRef.current?.click()} className={cn(buttonClass.secondary, "mt-3 h-9")}>
              <ImagePlus size={15} aria-hidden="true" /> Choose files
            </button>
            <p className="mt-3 text-xs text-subtle">JPG, PNG, WebP, GIF or AVIF · up to 4 MB each</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          onChange={(e) => {
            upload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Grid */}
      {loading && !items.length ? (
        <div className="flex items-center justify-center gap-3 py-14 text-sm text-muted">
          <Spinner /> Loading images…
        </div>
      ) : !items.length ? (
        <p className="py-14 text-center text-sm text-muted">No images uploaded yet.</p>
      ) : (
        <ul className={cn("mt-6 grid gap-3", mode === "pick" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5")}>
          {items.map((item) => (
            <li key={item.id} className="group overflow-hidden rounded-xl border border-line bg-card">
              {mode === "pick" ? (
                <button
                  type="button"
                  onClick={() => onPick?.(item)}
                  className="block aspect-[4/3] w-full overflow-hidden bg-bg-2 focus-visible:outline-offset-[-2px]"
                  aria-label={`Use ${item.filename}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnails */}
                  <img src={item.url} alt="" loading="lazy" className="size-full object-cover transition-transform group-hover:scale-105" />
                </button>
              ) : (
                <div className="aspect-[4/3] overflow-hidden bg-bg-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnails */}
                  <img src={item.url} alt="" loading="lazy" className="size-full object-cover" />
                </div>
              )}
              <div className="p-2.5">
                <p className="truncate text-xs font-medium text-fg" title={item.filename}>
                  {item.filename}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-subtle">
                  {formatBytes(item.size)} · {relativeTime(item.createdAt)}
                </p>
                {mode === "manage" && (
                  <div className="mt-2 flex items-center gap-1">
                    <button type="button" onClick={() => copy(item, "url")} className={cn(buttonClass.ghost, "h-7 px-2 text-xs")}>
                      {copied === `${item.id}-url` ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />} URL
                    </button>
                    <button type="button" onClick={() => copy(item, "md")} className={cn(buttonClass.ghost, "h-7 px-2 text-xs")}>
                      {copied === `${item.id}-md` ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />} Markdown
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(item)}
                      aria-label={`Delete ${item.filename}`}
                      className={cn(buttonClass.icon, "ml-auto size-7 hover:text-danger")}
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="mt-6 text-center">
          <button type="button" onClick={() => {
              setLoading(true);
              load(items.at(-1)?.id);
            }} disabled={loading} className={buttonClass.secondary}>
            {loading && <Spinner size={14} />} Load more
          </button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => !deleting && setToDelete(null)}
        onConfirm={confirmDelete}
        busy={deleting}
        title="Delete this image?"
        description="Posts that use it will show a broken image. This can't be undone."
      />
    </div>
  );
}
