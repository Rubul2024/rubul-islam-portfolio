import { cn } from "@/lib/utils";

const tones = {
  neutral: "border-line bg-bg-2 text-muted",
  accent: "border-accent-text/25 bg-accent-soft text-accent-text",
  outline: "border-line-strong bg-transparent text-fg",
};

export default function Badge({ children, tone = "neutral", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] leading-none tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
