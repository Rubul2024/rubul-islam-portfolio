import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { getAdminSession } from "@/lib/admin";
import { getAuthIssue } from "@/lib/auth";
import { site } from "@/lib/site";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

/** Only same-site paths inside /admin are allowed as a post-login destination. */
function safeNext(value) {
  return typeof value === "string" && /^\/admin(\/|$)/.test(value) && !value.startsWith("//") ? value : "/admin";
}

export default async function LoginPage({ searchParams }) {
  const next = safeNext((await searchParams).next);
  if (await getAdminSession()) redirect(next);
  const issue = getAuthIssue();

  return (
    <div className="relative isolate grid min-h-dvh place-items-center overflow-hidden px-4 py-16">
      <div aria-hidden="true" className="grid-bg absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/3 -z-10 h-[30rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,var(--accent-soft),transparent)]"
      />
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <span className="relative grid size-12 place-items-center rounded-xl border border-line-strong bg-card font-mono text-sm font-semibold text-fg">
            {site.monogram}
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-accent" />
          </span>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-fg">Sign in to Blog Studio</h1>
          <p className="mt-2 text-sm text-muted">Write, schedule and publish articles for {site.name}.</p>
        </div>

        <div className="mt-8 rounded-2xl border border-line bg-card p-6 shadow-card">
          {!issue ? (
            <LoginForm next={next} />
          ) : (
            <div className="text-sm leading-relaxed text-muted">
              <p className="font-medium text-fg">Admin login isn&apos;t configured yet.</p>
              <p className="mt-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-fg">{issue}</p>
              <p className="mt-3">
                Run <code className="font-mono text-fg">npm run admin:setup</code> and copy the printed variables into{" "}
                <code className="font-mono text-fg">.env.local</code>, then restart the server. See the README for details.
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-subtle">
          <Link href="/" className="hover:text-fg">
            ← Back to {site.name}
          </Link>
        </p>
      </div>
    </div>
  );
}
