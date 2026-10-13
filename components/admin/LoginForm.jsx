"use client";

import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Field, Spinner, buttonClass, inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export default function LoginForm({ next }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Sign-in failed.");
      // Full navigation so the new session cookie is used everywhere.
      window.location.assign(next);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5" noValidate>
      {error && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}
      <Field label="Email" htmlFor="email">
        <input id="email" name="email" type="email" autoComplete="username" required autoFocus className={cn(inputClass, "h-11")} />
      </Field>
      <Field label="Password" htmlFor="password">
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className={cn(inputClass, "h-11 pr-11")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-subtle hover:text-fg"
          >
            {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
        </div>
      </Field>
      <button type="submit" disabled={busy} className={cn(buttonClass.primary, "h-11")}>
        {busy ? <Spinner /> : <LogIn size={16} aria-hidden="true" />}
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
