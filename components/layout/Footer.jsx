import Link from "next/link";
import { ArrowUp, Mail } from "lucide-react";
import { navItems, site } from "@/lib/site";
import Wordmark from "@/components/layout/Wordmark";
import { SocialIconLinks } from "@/components/ui/SocialLinks";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-bg-2">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_auto] md:items-start">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-5 text-sm leading-relaxed text-muted">{site.tagline}</p>
            <a
              href={`mailto:${site.email}`}
              className="mt-5 inline-flex items-center gap-2 text-sm text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent"
            >
              <Mail size={16} aria-hidden="true" />
              {site.email}
            </a>
          </div>

          <nav aria-label="Footer">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-subtle">Navigate</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
              {navItems.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="text-sm text-muted transition-colors hover:text-fg">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/projects" className="text-sm text-muted transition-colors hover:text-fg">
                  All projects
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-subtle">Elsewhere</p>
            <SocialIconLinks className="mt-4" />
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-subtle">
            © {year} {site.name}. Designed and built with Next.js &amp; Tailwind CSS.
          </p>
          <a
            href="#top"
            className="inline-flex items-center gap-2 self-start rounded-full border border-line px-4 py-2 text-xs text-muted transition-colors hover:border-line-strong hover:text-fg sm:self-auto"
          >
            Back to top
            <ArrowUp size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
