"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { postState } from "@/lib/blog/utils";
import { cn } from "@/lib/utils";
import { buttonClass } from "@/components/admin/styles";

export { buttonClass, inputClass } from "@/components/admin/styles";

// Small building blocks shared across the admin panel.

export function Field({ label, htmlFor, hint, error, counter, children, className }) {
  return (
    <div className={cn("grid min-w-0 grid-cols-1 gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-fg">
          {label}
        </label>
        {counter}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-subtle [overflow-wrap:anywhere]">{hint}</p>
      )}
    </div>
  );
}

export function CharCount({ value = "", max }) {
  const over = value.length > max;
  return (
    <span className={cn("font-mono text-[11px]", over ? "text-danger" : "text-subtle")}>
      {value.length}/{max}
    </span>
  );
}

const STATE_STYLES = {
  published: "border-success/30 bg-success/10 text-success",
  scheduled: "border-blue/30 bg-blue/10 text-blue",
  draft: "border-line-strong bg-bg-2 text-muted",
};

export function StatusBadge({ post }) {
  const state = postState(post);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[11px] capitalize leading-5",
        STATE_STYLES[state],
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {state}
    </span>
  );
}

export function Card({ children, className, ...props }) {
  return (
    <div className={cn("rounded-2xl border border-line bg-card", className)} {...props}>
      {children}
    </div>
  );
}

export function Spinner({ size = 16, className }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={cn("inline-block animate-spin rounded-full border-2 border-current border-r-transparent", className)}
    />
  );
}

/** Fetch wrapper for the admin API: parses JSON and sends expired sessions to login. */
export async function api(path, { method = "GET", body, signal } = {}) {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const res = await fetch(path, {
    method,
    signal,
    headers: body && !isForm ? { "Content-Type": "application/json" } : undefined,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  const data = await res.json().catch(() => ({ ok: false, message: "Unexpected server response." }));
  if (res.status === 401) {
    // Full reload on an expired session so every cached admin view is dropped.
    const login = new URL("/admin/login", window.location.origin);
    login.searchParams.set("next", window.location.pathname);
    window.location.assign(login.href);
  }
  if (!res.ok || data.ok === false) {
    const error = new Error(data.message || "Something went wrong.");
    error.status = res.status;
    error.errors = data.errors;
    throw error;
  }
  return data;
}

// ── Toasts ───────────────────────────────────────────────────

const ToastContext = createContext(() => {});

export function useToast() {
  return useContext(ToastContext);
}

const TOAST_ICONS = { success: CheckCircle2, error: AlertTriangle, info: Info };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (message, type = "success") => {
      const id = ++nextId.current;
      setToasts((list) => [...list.slice(-3), { id, message, type }]);
      setTimeout(() => dismiss(id), type === "error" ? 6000 : 3500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[80] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
      >
        {toasts.map((t) => {
          const Icon = TOAST_ICONS[t.type];
          return (
            <div
              key={t.id}
              role={t.type === "error" ? "alert" : "status"}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line-strong bg-card p-3.5 text-sm text-fg shadow-card sm:w-auto sm:min-w-72"
            >
              <Icon
                size={18}
                aria-hidden="true"
                className={cn("mt-px shrink-0", t.type === "error" ? "text-danger" : t.type === "info" ? "text-blue" : "text-success")}
              />
              <p className="flex-1 leading-snug">{t.message}</p>
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-subtle hover:text-fg">
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// ── Dialog ───────────────────────────────────────────────────

/** Modal built on <dialog>, which gives focus trapping and Esc for free. */
export function Dialog({ open, onClose, title, description, children, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="dialog-title"
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line-strong bg-card p-0 text-fg shadow-card backdrop:bg-black/60 backdrop:backdrop-blur-sm",
        className,
      )}
    >
      {open && (
        <div className="p-6">
          <h2 id="dialog-title" className="text-lg font-semibold tracking-tight">
            {title}
          </h2>
          {description && <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>}
          {children}
        </div>
      )}
    </dialog>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = "Delete", busy }) {
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description}>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" onClick={onClose} className={buttonClass.secondary}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} disabled={busy} className={buttonClass.danger}>
          {busy && <Spinner size={14} />}
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function relativeTime(value) {
  if (!value) return "";
  const diff = (new Date(value).getTime() - Date.now()) / 1000;
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, seconds] of units) {
    if (Math.abs(diff) >= seconds) return rtf.format(Math.round(diff / seconds), unit);
  }
  return "just now";
}
