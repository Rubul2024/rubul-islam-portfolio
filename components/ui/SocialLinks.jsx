import { socialLinks } from "@/data/social-links";
import { brandIcons } from "@/components/ui/BrandIcons";
import { cn } from "@/lib/utils";

/** Icon-only social links with accessible names. */
export function SocialIconLinks({ className, size = 18 }) {
  return (
    <ul className={cn("flex items-center gap-2", className)}>
      {socialLinks.map(({ label, href, icon }) => {
        const Icon = brandIcons[icon];
        return (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${label} (opens in a new tab)`}
              className="grid size-10 place-items-center rounded-full border border-line text-muted transition-colors hover:border-line-strong hover:text-fg"
            >
              <Icon size={size} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** Labelled social links (icon + network + handle). */
export function SocialListLinks({ className }) {
  return (
    <ul className={cn("grid gap-2 sm:grid-cols-2", className)}>
      {socialLinks.map(({ label, href, icon, handle }) => {
        const Icon = brandIcons[icon];
        return (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-line bg-bg-2 px-4 py-2.5 transition-colors hover:border-line-strong hover:bg-card"
            >
              <Icon size={18} className="text-muted transition-colors group-hover:text-fg" />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-fg">{label}</span>
                <span className="block truncate font-mono text-xs text-subtle">@{handle}</span>
              </span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
