import Link from "next/link";
import { cn, isExternal } from "@/lib/utils";

const base =
  "group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium " +
  "transition-[background-color,border-color,color,transform,box-shadow] duration-200 " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";

const variants = {
  primary:
    "bg-accent-strong text-white shadow-[0_8px_24px_-12px_var(--accent)] hover:brightness-110 hover:shadow-[0_10px_30px_-10px_var(--accent)]",
  secondary:
    "border border-line-strong bg-card text-fg hover:border-accent-text/50 hover:bg-card-hover",
  ghost: "text-muted hover:text-fg",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

/**
 * Renders a Next.js <Link> for internal routes, an <a> for external/download
 * links, or a <button> when no href is given.
 */
export default function Button({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  external,
  download,
  ...props
}) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (!href) {
    return (
      <button className={classes} {...props}>
        {children}
      </button>
    );
  }

  const openInNewTab = external ?? isExternal(href);

  if (openInNewTab || download || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a
        href={href}
        className={classes}
        download={download}
        {...(openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}
