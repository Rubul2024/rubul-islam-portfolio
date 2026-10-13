import { cn } from "@/lib/utils";

/**
 * Illustrative product mockups drawn with HTML/CSS. They are NOT screenshots
 * of the live applications and are labelled as such. To use real screenshots,
 * add them to /public/images and swap this for next/image.
 */

const Bar = ({ className }) => <span aria-hidden="true" className={cn("block rounded-full bg-line-strong", className)} />;

function Frame({ url, children, className }) {
  return (
    <div className={cn("flex h-full flex-col overflow-hidden rounded-xl border border-line bg-bg shadow-card", className)}>
      <div className="flex items-center gap-3 border-b border-line bg-bg-2 px-3 py-2">
        <div className="flex gap-1" aria-hidden="true">
          <span className="size-2 rounded-full bg-line-strong" />
          <span className="size-2 rounded-full bg-line-strong" />
          <span className="size-2 rounded-full bg-line-strong" />
        </div>
        <div className="min-w-0 flex-1 truncate rounded-md border border-line bg-bg px-2 py-0.5 text-center font-mono text-[10px] text-subtle">
          {url}
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden p-3 sm:p-4">{children}</div>
    </div>
  );
}

function Storefront() {
  const cats = ["Wellness", "Water", "Fashion", "EV"];
  return (
    <Frame url="kuwifr.in">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold tracking-widest text-fg">KUWIFR</span>
        <div className="flex items-center gap-2">
          <Bar className="h-1.5 w-8" />
          <Bar className="h-1.5 w-8" />
          <span className="rounded-md bg-accent-strong px-1.5 py-0.5 font-mono text-[9px] text-white">Cart</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-[1.6fr_1fr] gap-3">
        <div className="space-y-3">
          <div className="rounded-lg border border-line bg-gradient-to-br from-accent-soft to-transparent p-3">
            <Bar className="h-2 w-2/3 bg-fg/70" />
            <Bar className="mt-2 h-1.5 w-1/2" />
            <span className="mt-3 inline-block rounded bg-fg px-2 py-0.5 font-mono text-[9px] text-bg">Shop now</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {cats.map((c) => (
              <div key={c} className="rounded-md border border-line bg-bg-2 px-1 py-2 text-center font-mono text-[8px] text-muted">
                {c}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-md border border-line bg-bg-2 p-1.5">
                <div className="aspect-square rounded bg-gradient-to-br from-line-strong to-transparent" />
                <Bar className="mt-1.5 h-1 w-3/4" />
                <Bar className="mt-1 h-1 w-1/3 bg-accent/60" />
              </div>
            ))}
          </div>
        </div>
        {/* Binary-tree referral structure */}
        <div className="rounded-lg border border-line bg-bg-2 p-2">
          <p className="font-mono text-[8px] uppercase tracking-wider text-subtle">Downline</p>
          <svg viewBox="0 0 100 92" className="mt-1 w-full" aria-hidden="true">
            <g stroke="var(--line-strong)" strokeWidth="1" fill="none">
              <path d="M50 14 L28 40 M50 14 L72 40 M28 40 L16 68 M28 40 L40 68 M72 40 L60 68 M72 40 L84 68" />
            </g>
            <circle cx="50" cy="14" r="7" fill="var(--accent)" />
            {[
              [28, 40],
              [72, 40],
            ].map(([x, y]) => (
              <circle key={x} cx={x} cy={y} r="6" fill="var(--card)" stroke="var(--accent-text)" strokeWidth="1.5" />
            ))}
            {[16, 40, 60, 84].map((x) => (
              <circle key={x} cx={x} cy="68" r="5" fill="var(--card)" stroke="var(--line-strong)" strokeWidth="1.5" />
            ))}
            <rect x="8" y="80" width="84" height="6" rx="3" fill="var(--line)" />
            <rect x="8" y="80" width="46" height="6" rx="3" fill="var(--blue)" opacity="0.7" />
          </svg>
          <Bar className="mt-1 h-1 w-2/3" />
        </div>
      </div>
    </Frame>
  );
}

function Booking() {
  const steps = ["Inquiry", "Quote", "Booked", "Moved"];
  return (
    <Frame url="shiftease · booking">
      <div className="grid h-full grid-cols-[1fr_1.15fr] gap-3">
        <div className="space-y-2 rounded-lg border border-line bg-bg-2 p-2.5">
          <p className="font-mono text-[9px] uppercase tracking-wider text-subtle">New booking</p>
          {["Pickup", "Drop-off"].map((l) => (
            <div key={l}>
              <p className="font-mono text-[8px] text-subtle">{l}</p>
              <div className="mt-0.5 h-5 rounded border border-line bg-bg" />
            </div>
          ))}
          <div className="flex flex-wrap gap-1 pt-1">
            {["Packing", "Storage", "Assembly"].map((s, i) => (
              <span
                key={s}
                className={cn(
                  "rounded border px-1.5 py-0.5 font-mono text-[8px]",
                  i === 0 ? "border-accent/50 bg-accent-soft text-accent-text" : "border-line text-subtle",
                )}
              >
                {s}
              </span>
            ))}
          </div>
          <div className="mt-1 h-5 rounded bg-accent-strong" />
        </div>
        <div className="space-y-2">
          <div className="rounded-lg border border-line bg-bg-2 p-2.5">
            <p className="font-mono text-[9px] uppercase tracking-wider text-subtle">Quote · server-side</p>
            {["Base", "Distance", "Add-ons"].map((l, i) => (
              <div key={l} className="mt-1.5 flex items-center justify-between gap-2">
                <span className="font-mono text-[8px] text-muted">{l}</span>
                <Bar className={cn("h-1", ["w-8", "w-12", "w-6"][i])} />
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-line pt-1.5">
              <span className="font-mono text-[8px] text-fg">Total</span>
              <Bar className="h-1.5 w-10 bg-fg/70" />
            </div>
          </div>
          <div className="rounded-lg border border-line bg-bg-2 p-2.5">
            <p className="font-mono text-[9px] text-subtle">Booking #SE-•••</p>
            <ol className="mt-2 flex items-center">
              {steps.map((s, i) => (
                <li key={s} className="flex flex-1 flex-col items-center gap-1">
                  <span
                    className={cn(
                      "size-2.5 rounded-full border",
                      i < 2 ? "border-accent bg-accent" : i === 2 ? "border-accent-text bg-card" : "border-line-strong bg-card",
                    )}
                  />
                  <span className="font-mono text-[7px] text-subtle">{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex gap-1">
            <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[8px] text-subtle">customer</span>
            <span className="rounded border border-blue/40 px-1.5 py-0.5 font-mono text-[8px] text-blue">admin</span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function Services() {
  const items = ["Registration", "GST & Tax", "Trademark", "ISO", "Legal docs", "Web & apps"];
  return (
    <Frame url="digiadssolution.in">
      <Bar className="h-2 w-1/2 bg-fg/70" />
      <Bar className="mt-1.5 h-1.5 w-1/3" />
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {items.map((s, i) => (
          <div key={s} className="rounded-md border border-line bg-bg-2 p-2">
            <span className={cn("block size-3 rounded", i % 2 ? "bg-blue/50" : "bg-accent/60")} />
            <p className="mt-1.5 truncate font-mono text-[8px] text-muted">{s}</p>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function Agency() {
  const services = ["Web", "UI/UX", "Software"];
  return (
    <Frame url="indilens.com">
      <div className="flex items-center justify-between">
        <Bar className="h-2 w-14 bg-fg/70" />
        <span className="rounded bg-accent-strong px-1.5 py-0.5 font-mono text-[8px] text-white">Let&apos;s Talk</span>
      </div>
      <div className="mt-3 grid grid-cols-[1.3fr_1fr] gap-2">
        <div>
          <Bar className="h-2 w-full bg-fg/60" />
          <Bar className="mt-1.5 h-2 w-4/5 bg-fg/60" />
          <Bar className="mt-2 h-1 w-full" />
          <Bar className="mt-1 h-1 w-2/3" />
          <span className="mt-2.5 inline-block rounded bg-accent/70 px-2 py-1 font-mono text-[7px] text-white">Start a Project</span>
        </div>
        <div className="rounded-md border border-line bg-bg-2 p-1.5">
          <p className="font-mono text-[7px] text-subtle">Growth</p>
          <svg viewBox="0 0 60 24" className="mt-1 h-6 w-full" preserveAspectRatio="none">
            <polyline points="0,20 10,17 20,18 30,12 40,10 50,6 60,3" fill="none" stroke="var(--accent)" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {services.map((s, i) => (
          <div key={s} className="rounded-md border border-line bg-bg-2 p-1.5">
            <span className="font-mono text-[7px] text-subtle">0{i + 1}</span>
            <p className="truncate font-mono text-[8px] text-muted">{s}</p>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function Organisation() {
  return (
    <Frame url="allindialabourparty.com">
      <div className="flex items-center justify-between">
        <Bar className="h-2 w-16 bg-fg/70" />
        <span className="rounded bg-accent-strong px-1.5 py-0.5 font-mono text-[8px] text-white">Join</span>
      </div>
      <div className="mt-3 rounded-md border border-line bg-gradient-to-r from-accent-soft to-transparent p-2.5">
        <Bar className="h-1.5 w-3/4 bg-fg/60" />
        <Bar className="mt-1.5 h-1 w-1/2" />
      </div>
      <p className="mt-3 font-mono text-[8px] uppercase tracking-wider text-subtle">Latest news</p>
      <div className="mt-1.5 grid grid-cols-3 gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-md border border-line bg-bg-2 p-1.5">
            <div className="h-6 rounded bg-line" />
            <Bar className="mt-1.5 h-1 w-full" />
          </div>
        ))}
      </div>
    </Frame>
  );
}

function Recipes() {
  const tints = ["from-amber-500/40", "from-emerald-500/40", "from-rose-500/40", "from-sky-500/40"];
  return (
    <Frame url="recipe-app · search">
      <div className="flex h-5 items-center gap-1.5 rounded-full border border-line bg-bg-2 px-2">
        <span className="size-2 rounded-full border border-subtle" />
        <Bar className="h-1 w-16" />
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {tints.map((t) => (
          <div key={t} className="rounded-md border border-line bg-bg-2 p-1">
            <div className={cn("aspect-[4/3] rounded bg-gradient-to-br to-transparent", t)} />
            <Bar className="mt-1 h-1 w-3/4" />
          </div>
        ))}
      </div>
    </Frame>
  );
}

function Testing() {
  const rows = [
    ["TC-KYC-01", "pass"],
    ["TC-KYC-02", "pass"],
    ["TC-AML-01", "fail"],
    ["TC-AML-02", "pass"],
  ];
  return (
    <Frame url="test-report · simulated bank">
      <div className="overflow-hidden rounded-md border border-line">
        {rows.map(([id, status], i) => (
          <div
            key={id}
            className={cn("flex items-center justify-between gap-2 px-2 py-1.5", i > 0 && "border-t border-line")}
          >
            <span className="font-mono text-[8px] text-muted">{id}</span>
            <Bar className="h-1 flex-1" />
            <span
              className={cn(
                "rounded px-1 font-mono text-[7px] uppercase",
                status === "pass" ? "bg-success/15 text-success" : "bg-danger/15 text-danger",
              )}
            >
              {status}
            </span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

const variants = {
  storefront: Storefront,
  booking: Booking,
  services: Services,
  agency: Agency,
  organisation: Organisation,
  recipes: Recipes,
  testing: Testing,
};

export default function ProjectVisual({ variant, title, className, showLabel = true }) {
  const Visual = variants[variant] ?? Services;
  return (
    <div
      role="img"
      aria-label={`Illustrative mockup of ${title}. Not a screenshot of the live application.`}
      className={cn("relative select-none", className)}
    >
      <div aria-hidden="true" className="h-full">
        <Visual />
      </div>
      {showLabel && (
        <span
          aria-hidden="true"
          className="absolute bottom-2 right-2 rounded-full border border-line bg-bg/85 px-2 py-0.5 font-mono text-[9px] text-subtle backdrop-blur"
        >
          Illustrative mockup
        </span>
      )}
    </div>
  );
}
