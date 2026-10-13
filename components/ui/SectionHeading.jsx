import { cn } from "@/lib/utils";

/**
 * Editorial section header: mono index + eyebrow, large title, optional lede.
 */
export default function SectionHeading({ index, eyebrow, title, description, id, align = "left", as: H = "h2", className }) {
  return (
    <header className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-subtle">
        {index && <span className="text-accent-text">{index}</span>}
        {index && <span aria-hidden="true" className="h-px w-8 bg-line-strong" />}
        <span>{eyebrow}</span>
      </p>
      <H
        id={id}
        className="mt-4 text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-fg sm:text-4xl md:text-[2.5rem] short:text-[2.15rem]"
      >
        {title}
      </H>
      {description && (
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted sm:text-lg short:text-base">{description}</p>
      )}
    </header>
  );
}
