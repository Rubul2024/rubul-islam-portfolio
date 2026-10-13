"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, Menu, X, ArrowRight } from "lucide-react";
import { navItems, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/layout/ThemeToggle";
import Wordmark from "@/components/layout/Wordmark";

export default function Navbar({ resumeAvailable = false }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");

  const menuButtonRef = useRef(null);
  const panelRef = useRef(null);

  // Translucent background once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the section currently in view (home page only)
  useEffect(() => {
    if (!isHome || !("IntersectionObserver" in window)) return;
    const sections = navItems.map((item) => document.getElementById(item.id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [isHome]);

  const closeMenu = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) menuButtonRef.current?.focus();
  }, []);

  // Close the menu on route change (adjusting state during render, as React recommends)
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  // Mobile menu: Escape to close, focus trap, body scroll lock, close on desktop resize
  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const focusables = () =>
      [menuButtonRef.current, ...(panel?.querySelectorAll("a[href], button:not([disabled])") ?? [])].filter(Boolean);

    focusables()[1]?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key === "Tab") {
        const items = focusables();
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    const mq = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = (e) => e.matches && setOpen(false);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    mq.addEventListener("change", onBreakpoint);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      mq.removeEventListener("change", onBreakpoint);
    };
  }, [open, closeMenu]);

  // Section links highlight while scrolling the home page; page links (Blog) by route.
  const isActive = (item) =>
    item.href.startsWith("/#") ? isHome && active === item.id : pathname.startsWith(item.href);

  // After scrolling, the bar becomes a centred floating pill on an inverted surface.
  // The open mobile menu always uses the full-width bar.
  const pill = scrolled && !open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[padding,background-color] duration-500",
        pill ? "px-3 pt-3" : "px-0 pt-0",
        open && "border-b border-line bg-bg",
      )}
    >
      <a
        href="#main"
        className="sr-only rounded-md bg-accent-strong px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[70]"
      >
        Skip to content
      </a>

      <nav
        aria-label="Primary"
        className={cn(
          "mx-auto flex w-full items-center justify-between gap-4 border ease-[cubic-bezier(0.22,1,0.36,1)]",
          "transition-[max-width,height,padding,background-color,border-color,border-radius,box-shadow] duration-500",
          pill
            ? "h-14 max-w-[66rem] rounded-full border-fg/10 bg-fg/95 pl-2.5 pr-2 shadow-[0_18px_50px_-18px_rgb(0_0_0/0.55)] backdrop-blur-xl"
            : "h-16 max-w-[72rem] rounded-none border-transparent px-5 sm:px-8 md:h-[4.5rem]",
        )}
      >
        <Wordmark tone={pill ? "inverted" : "default"} />

        <ul className="hidden items-center gap-0.5 lg:flex xl:gap-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                aria-current={isActive(item) ? "true" : undefined}
                className={cn(
                  "relative rounded-full transition-colors",
                  pill
                    ? cn(
                        "whitespace-nowrap px-2 py-2 font-mono text-[11.5px] uppercase tracking-[0.12em] xl:px-2.5",
                        isActive(item) ? "text-bg" : "text-bg/60 hover:text-bg",
                      )
                    : cn("whitespace-nowrap px-2.5 py-2 text-sm xl:px-3.5", isActive(item) ? "text-fg" : "text-muted hover:text-fg"),
                )}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -bottom-0.5 h-px bg-accent transition-opacity",
                    pill ? "inset-x-2 xl:inset-x-2.5" : "inset-x-2.5 xl:inset-x-3.5",
                    isActive(item) ? "opacity-100" : "opacity-0",
                  )}
                />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:grid" tone={pill ? "inverted" : "default"} />
          {resumeAvailable && (
            <a
              href={site.resumePath}
              download="Rubul-Islam-Resume.pdf"
              className={cn(
                "hidden h-10 items-center gap-2 rounded-full border px-4 text-sm transition-colors md:inline-flex lg:hidden",
                pill ? "border-bg/15 text-bg/70 hover:text-bg" : "border-line text-muted hover:border-line-strong hover:text-fg xl:inline-flex",
              )}
            >
              <Download size={16} aria-hidden="true" />
              Resume
            </a>
          )}
          <Link
            href="/#contact"
            className="hidden h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-accent-strong px-4 text-sm font-medium text-white transition-[filter,transform] hover:brightness-110 active:scale-[0.98] sm:inline-flex"
          >
            Let&apos;s Talk
            <ArrowRight size={16} aria-hidden="true" />
          </Link>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => (open ? closeMenu(false) : setOpen(true))}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className={cn(
              "grid size-10 place-items-center rounded-full border transition-colors lg:hidden",
              pill ? "border-bg/15 text-bg hover:border-bg/30" : "border-line text-fg hover:border-line-strong",
            )}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-bg lg:hidden"
      >
        <div className="container-x flex min-h-full flex-col pb-8 pt-4">
          <ul className="flex flex-col">
            {navItems.map((item, i) => (
              <li key={item.id} className="border-b border-line">
                <Link
                  href={item.href}
                  onClick={() => closeMenu(false)}
                  aria-current={isActive(item) ? "true" : undefined}
                  className="flex items-baseline gap-4 py-4 text-2xl font-medium tracking-tight text-fg"
                >
                  <span className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 grid gap-3">
            <Link
              href="/#contact"
              onClick={() => closeMenu(false)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent-strong text-[15px] font-medium text-white"
            >
              Let&apos;s Talk <ArrowRight size={16} aria-hidden="true" />
            </Link>
            {resumeAvailable && (
              <a
                href={site.resumePath}
                download="Rubul-Islam-Resume.pdf"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line-strong text-[15px] text-fg"
              >
                <Download size={16} aria-hidden="true" /> Download Resume
              </a>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between pt-10">
            <a href={`mailto:${site.email}`} className="truncate font-mono text-xs text-muted hover:text-fg">
              {site.email}
            </a>
            <ThemeToggle className="shrink-0" />
          </div>
        </div>
      </div>
    </header>
  );
}
