import { Quote } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

/**
 * Client testimonials. Renders nothing until `items` has real quotes
 * (see `testimonials` in data/services.js).
 */
export default function Testimonials({ items }) {
  if (!items?.length) return null;

  return (
    <section aria-labelledby="testimonials-title" className="section-y border-t border-line">
      <div className="container-x">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-subtle">Testimonials</p>
        <h2 id="testimonials-title" className="mt-4 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          What clients say.
        </h2>
        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <Reveal as="li" key={`${t.name}-${i}`} delay={i * 60}>
              <figure className="flex h-full flex-col rounded-2xl border border-line bg-card p-6">
                <Quote size={22} aria-hidden="true" className="text-accent-text" />
                <blockquote className="mt-4 flex-1 text-pretty leading-relaxed text-fg">“{t.quote}”</blockquote>
                <figcaption className="mt-6 text-sm">
                  <span className="block font-medium text-fg">{t.name}</span>
                  <span className="text-subtle">{[t.role, t.company].filter(Boolean).join(", ")}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
