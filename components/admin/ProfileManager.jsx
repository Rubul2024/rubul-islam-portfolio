"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
import { Card, Field, Spinner, api, buttonClass, inputClass, relativeTime, useToast } from "@/components/admin/ui";
import { PASSWORD_MIN_LENGTH, checkNewPassword, passwordScore } from "@/lib/password-rules";
import { cn } from "@/lib/utils";
import avatar from "@/public/images/rubul-islam-avatar.jpg";

const SCORE = [
  { label: "Too weak", className: "bg-danger" },
  { label: "Weak", className: "bg-danger" },
  { label: "Fair", className: "bg-[#f59e0b]" },
  { label: "Good", className: "bg-success" },
  { label: "Strong", className: "bg-success" },
];

function PasswordInput({ id, value, onChange, autoComplete, invalid, describedBy, show, onToggle }) {
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn(inputClass, "h-11 pr-11")}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? "Hide passwords" : "Show passwords"}
        className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-subtle hover:text-fg"
      >
        {show ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
      </button>
    </div>
  );
}

function DetailsForm({ profile, onSaved }) {
  const toast = useToast();
  const uid = useId();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const emailChanged = email.trim().toLowerCase() !== profile.email.toLowerCase();
  const dirty = name.trim() !== profile.name || emailChanged;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const data = await api("/api/admin/profile", {
        method: "PATCH",
        body: { name, email, currentPassword: emailChanged ? currentPassword : undefined },
      });
      setCurrentPassword("");
      toast(data.emailChanged ? "Profile saved. Use your new email next time you sign in." : "Profile saved.");
      onSaved(data.profile);
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent-text">
          <UserRound size={18} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-semibold text-fg">Account details</h2>
          <p className="text-sm text-muted">Your name in the panel and the email you sign in with.</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-5" noValidate>
        <Field label="Display name" htmlFor={`${uid}-name`} error={errors.name}>
          <input
            id={`${uid}-name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={80}
            aria-invalid={Boolean(errors.name) || undefined}
            className={cn(inputClass, "h-11")}
          />
        </Field>
        <Field
          label="Sign-in email"
          htmlFor={`${uid}-email`}
          error={errors.email}
          hint="Changing this changes the email you sign in with."
        >
          <input
            id={`${uid}-email`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            aria-invalid={Boolean(errors.email) || undefined}
            className={cn(inputClass, "h-11")}
          />
        </Field>
        {emailChanged && (
          <Field
            label="Current password"
            htmlFor={`${uid}-current`}
            error={errors.currentPassword}
            hint="Required to change your sign-in email."
          >
            <PasswordInput
              id={`${uid}-current`}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              invalid={Boolean(errors.currentPassword)}
              show={show}
              onToggle={() => setShow((v) => !v)}
            />
          </Field>
        )}
        <div>
          <button type="submit" disabled={!dirty || busy || (emailChanged && !currentPassword)} className={buttonClass.primary}>
            {busy ? <Spinner size={14} /> : <Save size={15} aria-hidden="true" />}
            Save changes
          </button>
        </div>
      </form>
    </Card>
  );
}

function PasswordForm({ profile, onSaved }) {
  const toast = useToast();
  const uid = useId();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const rule = next ? checkNewPassword(next, { email: profile.email, name: profile.name }) : null;
  const score = passwordScore(next);
  const mismatch = confirm && confirm !== next;
  const canSubmit = current && next && confirm && !rule && !mismatch && !busy;

  async function submit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setErrors({});
    try {
      const data = await api("/api/admin/profile/password", {
        method: "POST",
        body: { currentPassword: current, newPassword: next },
      });
      setCurrent("");
      setNext("");
      setConfirm("");
      toast("Password changed. Other devices have been signed out.");
      onSaved(data.profile);
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent-text">
          <KeyRound size={18} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-semibold text-fg">Change password</h2>
          <p className="text-sm text-muted">You&apos;ll stay signed in here; other devices are signed out.</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-5" noValidate>
        {/* Hidden username helps password managers update the right entry */}
        <input type="email" name="username" autoComplete="username" value={profile.email} readOnly hidden />
        <Field label="Current password" htmlFor={`${uid}-current`} error={errors.currentPassword}>
          <PasswordInput
            id={`${uid}-current`}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            invalid={Boolean(errors.currentPassword)}
            show={show}
            onToggle={() => setShow((v) => !v)}
          />
        </Field>
        <Field
          label="New password"
          htmlFor={`${uid}-new`}
          error={errors.newPassword || (next && rule) || undefined}
          hint={`At least ${PASSWORD_MIN_LENGTH} characters, mixing letters, numbers and symbols.`}
        >
          <PasswordInput
            id={`${uid}-new`}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            invalid={Boolean(errors.newPassword || (next && rule))}
            show={show}
            onToggle={() => setShow((v) => !v)}
          />
          {next && (
            <div className="mt-1 flex items-center gap-3" aria-live="polite">
              <div className="flex flex-1 gap-1" aria-hidden="true">
                {[1, 2, 3, 4].map((i) => (
                  <span key={i} className={cn("h-1.5 flex-1 rounded-full", i <= score ? SCORE[score].className : "bg-line")} />
                ))}
              </div>
              <span className="w-16 text-right text-xs text-muted">{SCORE[score].label}</span>
            </div>
          )}
        </Field>
        <Field label="Confirm new password" htmlFor={`${uid}-confirm`} error={mismatch ? "Passwords don't match." : undefined}>
          <PasswordInput
            id={`${uid}-confirm`}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            invalid={Boolean(mismatch)}
            show={show}
            onToggle={() => setShow((v) => !v)}
          />
        </Field>
        <div>
          <button type="submit" disabled={!canSubmit} className={buttonClass.primary}>
            {busy ? <Spinner size={14} /> : <KeyRound size={15} aria-hidden="true" />}
            Update password
          </button>
        </div>
      </form>
    </Card>
  );
}

export default function ProfileManager({ initialProfile }) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);

  function onSaved(next) {
    setProfile(next);
    router.refresh(); // update the name shown in the sidebar
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
      <Card className="h-fit p-6">
        <div className="flex flex-col items-center text-center">
          <Image src={avatar} alt="" width={88} height={88} className="size-22 rounded-3xl border border-line-strong object-cover" />
          <p className="mt-4 text-lg font-semibold text-fg">{profile.name}</p>
          <p className="break-all text-sm text-muted">{profile.email}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs text-success">
            <ShieldCheck size={13} aria-hidden="true" /> Administrator
          </span>
        </div>
        <dl className="mt-6 grid gap-3 border-t border-line pt-5 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Password changed</dt>
            <dd className="text-right text-fg">
              {profile.passwordChangedAt ? relativeTime(profile.passwordChangedAt) : "Not yet"}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Profile updated</dt>
            <dd className="text-right text-fg">{profile.updatedAt ? relativeTime(profile.updatedAt) : "Not yet"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Session length</dt>
            <dd className="text-right text-fg">7 days</dd>
          </div>
        </dl>
        {profile.source === "env" && (
          <p className="mt-5 rounded-xl border border-line bg-bg-2 p-3 text-xs leading-relaxed text-muted">
            Your account still comes from the initial setup (environment variables). Saving any change here moves it
            into the database, where you can manage it from now on.
          </p>
        )}
      </Card>

      <div className="grid gap-6">
        <DetailsForm key={`${profile.name}|${profile.email}`} profile={profile} onSaved={onSaved} />
        <PasswordForm profile={profile} onSaved={onSaved} />
      </div>
    </div>
  );
}
