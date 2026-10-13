"use client";

import { Suspense, useCallback, useId, useRef, useState } from "react";
import { Send, LoaderCircle, CircleCheck, CircleAlert, Lock } from "lucide-react";
import { validateContact, buildMailto, PROJECT_TYPES, BUDGET_RANGES, TIMELINE_OPTIONS, LIMITS } from "@/lib/validation";
import ServicePreselect from "@/components/sections/ServicePreselect";
import { cn } from "@/lib/utils";

const initial = { name: "", email: "", phone: "", projectType: "", budget: "", timeline: "", message: "", company: "" };

const selectChevron = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%238b8b95' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.9rem center",
};

const fieldBase =
  "mt-1.5 block w-full rounded-xl border bg-bg-2 px-4 py-2.5 text-[15px] text-fg placeholder:text-subtle " +
  "transition-colors focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent/30";

const primaryButton =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent-strong px-7 text-[15px] font-medium text-white " +
  "transition-[filter,transform] hover:brightness-110 active:scale-[0.98] disabled:opacity-70";

export default function ContactForm({ email, deliveryConfigured }) {
  const uid = useId();
  const formRef = useRef(null);
  const startedAt = useRef(null); // first interaction, used as a spam signal
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error | not_configured
  const [serverMessage, setServerMessage] = useState("");
  const [sentName, setSentName] = useState("");

  const ids = {
    name: `${uid}-name`,
    email: `${uid}-email`,
    phone: `${uid}-phone`,
    budget: `${uid}-budget`,
    timeline: `${uid}-timeline`,
    projectType: `${uid}-type`,
    message: `${uid}-message`,
  };

  function set(field, value) {
    startedAt.current ??= Date.now();
    const next = { ...values, [field]: value };
    setValues(next);
    // After the first submit attempt, re-validate as the user types
    if (touched) setErrors(validateContact(next).errors);
  }

  const update = (field) => (event) => set(field, event.target.value);

  // Topic preselected from a "Discuss this project" link (?service=<slug>).
  const preselect = useCallback((topic) => {
    setValues((v) => ({ ...v, projectType: topic }));
    setErrors((e) => (e.projectType ? { ...e, projectType: undefined } : e));
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    setTouched(true);

    const { errors: found, valid, data } = validateContact(values);
    setErrors(found);
    if (!valid) {
      // Focus the first invalid field in the order it appears on screen.
      const firstInvalid = ["projectType", "name", "email", "phone", "budget", "timeline", "message"].find((f) => found[f]);
      formRef.current?.querySelector(`#${CSS.escape(ids[firstInvalid])}`)?.focus();
      return;
    }

    if (!deliveryConfigured) {
      window.location.href = buildMailto(email, data);
      return;
    }

    setStatus("submitting");
    setServerMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          company: values.company,
          elapsed: startedAt.current ? Date.now() - startedAt.current : 0,
        }),
      });
      const body = await res.json().catch(() => ({}));

      if (res.ok && body.ok) {
        setSentName(data.name.split(" ")[0]);
        setStatus("success");
        setValues(initial);
        setTouched(false);
        startedAt.current = null;
        return;
      }
      if (body.code === "not_configured") {
        setStatus("not_configured");
        return;
      }
      if (body.errors) setErrors(body.errors);
      setServerMessage(body.message || "Something went wrong while sending your message.");
      setStatus("error");
    } catch {
      setServerMessage("Your message couldn't be sent — please check your connection and try again.");
      setStatus("error");
    }
  }

  const mailtoHref = buildMailto(email, values);

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex h-full min-h-[26rem] flex-col items-start justify-center rounded-2xl border border-success/30 bg-success/5 p-7 sm:p-9"
      >
        <span className="grid size-14 place-items-center rounded-full bg-success/15">
          <CircleCheck size={30} aria-hidden="true" className="text-success" />
        </span>
        <h3 className="mt-6 text-2xl font-semibold tracking-tight text-fg">
          Thanks{sentName ? `, ${sentName}` : ""} — your message is in.
        </h3>
        <p className="mt-3 max-w-md leading-relaxed text-muted">
          I&apos;ve received your details and will get back to you within 1–2 working days.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-8 text-sm text-fg underline decoration-line-strong underline-offset-4 hover:decoration-accent"
        >
          Send another message
        </button>
      </div>
    );
  }

  const describedBy = (field) => (errors[field] ? `${ids[field]}-error` : undefined);
  const submitting = status === "submitting";

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative">
      <Suspense fallback={null}>
        <ServicePreselect onSelect={preselect} />
      </Suspense>
      {!deliveryConfigured && (
        <div className="mb-6 flex gap-3 rounded-xl border border-line-strong bg-bg-2 p-4 text-sm text-muted">
          <CircleAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-blue" />
          <p>
            Online delivery isn&apos;t set up yet — sending opens your email app with the message ready, or email me at{" "}
            <a href={`mailto:${email}`} className="text-fg underline underline-offset-4">
              {email}
            </a>
            .
          </p>
        </div>
      )}

      {/* Topic as tappable chips — quicker than a dropdown, especially on phones */}
      <fieldset aria-describedby={describedBy("projectType")}>
        <legend className="text-sm font-medium text-fg">What can I help you with?</legend>
        <div id={ids.projectType} tabIndex={-1} className="mt-2.5 flex flex-wrap gap-2 outline-none">
          {PROJECT_TYPES.map((type) => {
            const selected = values.projectType === type;
            return (
              <label
                key={type}
                className={cn(
                  "cursor-pointer rounded-full border px-3 py-1 text-[13px] transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent-text",
                  selected
                    ? "border-accent-text/50 bg-accent-soft text-fg"
                    : errors.projectType
                      ? "border-danger/60 text-muted hover:text-fg"
                      : "border-line text-muted hover:border-line-strong hover:text-fg",
                )}
              >
                <input
                  type="radio"
                  name="projectType"
                  value={type}
                  checked={selected}
                  onChange={() => set("projectType", type)}
                  className="sr-only"
                />
                {type}
              </label>
            );
          })}
        </div>
        {errors.projectType && <FieldError id={`${ids.projectType}-error`}>{errors.projectType}</FieldError>}
      </fieldset>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 short:gap-3">
        <div>
          <label htmlFor={ids.name} className="text-sm font-medium text-fg">
            Your name
          </label>
          <input
            id={ids.name}
            name="name"
            type="text"
            autoComplete="name"
            maxLength={LIMITS.name.max}
            value={values.name}
            onChange={update("name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name")}
            className={cn(fieldBase, errors.name ? "border-danger" : "border-line")}
            placeholder="Jane Doe"
          />
          {errors.name && <FieldError id={`${ids.name}-error`}>{errors.name}</FieldError>}
        </div>

        <div>
          <label htmlFor={ids.email} className="text-sm font-medium text-fg">
            Email
          </label>
          <input
            id={ids.email}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={update("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("email")}
            className={cn(fieldBase, errors.email ? "border-danger" : "border-line")}
            placeholder="you@example.com"
          />
          {errors.email && <FieldError id={`${ids.email}-error`}>{errors.email}</FieldError>}
        </div>
      </div>

      <div className={cn("mt-4 grid gap-4 short:mt-3 short:gap-3", BUDGET_RANGES.length ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
      <div>
        <label htmlFor={ids.phone} className="text-sm font-medium text-fg">
          Phone / WhatsApp <span className="font-normal text-subtle">(optional)</span>
        </label>
        <input
          id={ids.phone}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={LIMITS.phone.max}
          value={values.phone}
          onChange={update("phone")}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={describedBy("phone")}
          className={cn(fieldBase, errors.phone ? "border-danger" : "border-line")}
          placeholder="+91 98765 43210"
        />
        {errors.phone && <FieldError id={`${ids.phone}-error`}>{errors.phone}</FieldError>}
      </div>

      {BUDGET_RANGES.length > 0 && (
        <OptionalSelect
          id={ids.budget}
          label="Budget"
          value={values.budget}
          onChange={update("budget")}
          options={BUDGET_RANGES}
          error={errors.budget}
        />
      )}
      <OptionalSelect
        id={ids.timeline}
        label="Timeline"
        value={values.timeline}
        onChange={update("timeline")}
        options={TIMELINE_OPTIONS}
        error={errors.timeline}
      />
      </div>

      <div className="mt-4 short:mt-3">
        <div className="flex items-baseline justify-between">
          <label htmlFor={ids.message} className="text-sm font-medium text-fg">
            Message
          </label>
          <span className="font-mono text-[11px] text-subtle" aria-hidden="true">
            {values.message.length}/{LIMITS.message.max}
          </span>
        </div>
        <textarea
          id={ids.message}
          name="message"
          rows={4}
          style={{ minHeight: "4rem" }}
          maxLength={LIMITS.message.max}
          value={values.message}
          onChange={update("message")}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy("message")}
          className={cn(fieldBase, "h-28 resize-y short:h-16", errors.message ? "border-danger" : "border-line")}
          placeholder="Tell me a little about your project, timeline or idea…"
        />
        {errors.message && <FieldError id={`${ids.message}-error`}>{errors.message}</FieldError>}
      </div>

      {/* Honeypot: hidden from people, tempting to bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input tabIndex={-1} autoComplete="off" name="company" value={values.company} onChange={update("company")} />
        </label>
      </div>

      <div aria-live="polite" className="empty:hidden">
        {status === "error" && (
          <div className="mt-5 flex gap-3 rounded-xl border border-danger/40 bg-danger/5 p-4 text-sm">
            <CircleAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-danger" />
            <p className="text-muted">
              {serverMessage}{" "}
              <a href={mailtoHref} className="text-fg underline underline-offset-4">
                Send it by email instead
              </a>
              .
            </p>
          </div>
        )}
        {status === "not_configured" && (
          <div className="mt-5 flex gap-3 rounded-xl border border-line-strong bg-bg-2 p-4 text-sm">
            <CircleAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-blue" />
            <p className="text-muted">
              Your message was <strong className="font-semibold text-fg">not sent</strong> — online delivery isn&apos;t
              set up yet.{" "}
              <a href={mailtoHref} className="text-fg underline underline-offset-4">
                Open it in your email app
              </a>{" "}
              to send it to {email}.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row-reverse sm:items-center sm:justify-between">
        <button type="submit" disabled={submitting} className={cn(primaryButton, "w-full sm:w-auto")}>
          {submitting ? (
            <>
              <LoaderCircle size={18} aria-hidden="true" className="animate-spin" />
              Sending…
            </>
          ) : (
            <>
              Send message
              <Send size={16} aria-hidden="true" />
            </>
          )}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-xs leading-relaxed text-subtle sm:justify-start">
          <Lock size={12} aria-hidden="true" className="shrink-0" />
          Your details are only used to reply to you.
        </p>
      </div>
    </form>
  );
}

function OptionalSelect({ id, label, value, onChange, options, error }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label} <span className="font-normal text-subtle">(optional)</span>
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        style={selectChevron}
        className={cn(fieldBase, "appearance-none pr-10", error ? "border-danger" : "border-line", !value && "text-subtle")}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}

function FieldError({ id, children }) {
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-[13px] text-danger">
      <CircleAlert size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
      {children}
    </p>
  );
}
