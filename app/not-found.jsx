import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[80dvh] items-center overflow-hidden">
      <div aria-hidden="true" className="grid-bg absolute inset-0 -z-10" />
      <div className="container-x py-32 text-center">
        <p className="font-mono text-sm text-accent-text">404</p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
          This page doesn&apos;t exist.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          The link may be outdated, or the page may have moved. Everything else is one click away.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to home
          </Button>
          <Button href="/projects" variant="secondary">
            View projects
          </Button>
        </div>
      </div>
    </section>
  );
}
