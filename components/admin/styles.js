// Class strings shared by admin Server and Client Components. Kept out of
// ui.jsx because values exported from a "use client" module reach Server
// Components as client references, not strings.

export const inputClass =
  "w-full rounded-xl border border-line bg-bg px-3.5 text-sm text-fg placeholder:text-subtle transition-colors " +
  "focus:border-accent-text/60 focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60 " +
  "aria-[invalid=true]:border-danger/60";

export const buttonClass = {
  primary:
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-accent-strong px-4 text-sm font-medium text-white transition-[filter,transform] hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
  secondary:
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line-strong bg-card px-4 text-sm text-fg transition-colors hover:bg-card-hover disabled:pointer-events-none disabled:opacity-60",
  ghost:
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm text-muted transition-colors hover:bg-card hover:text-fg disabled:pointer-events-none disabled:opacity-60",
  danger:
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-danger px-4 text-sm font-medium text-white transition-[filter] hover:brightness-110 disabled:pointer-events-none disabled:opacity-60",
  icon: "grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-card-hover hover:text-fg disabled:pointer-events-none disabled:opacity-50",
};
