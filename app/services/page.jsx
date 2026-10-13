import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  FileText,
  KeyRound,
  MessageCircle,
  Plus,
  UserRound,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import ServiceIcon from "@/components/services/ServiceIcon";
import Testimonials from "@/components/services/Testimonials";
import { ServiceCard } from "@/components/services/ServiceCard";
import {
  SHOW_PRICES,
  faqs,
  industries,
  processSteps,
  proof,
  reasons,
  services,
  testimonials,
} from "@/data/services";
import { projects } from "@/data/projects";
import { ogImages, site, whatsappHref } from "@/lib/site";
import { jsonLd, prettyUrl } from "@/lib/utils";

const title = "Business Website & Custom Web App Development in Guwahati";
const description =
  "Web developer in Guwahati building business websites, custom web applications and online stores for growing businesses across India. Fixed quotes, code you own.";

export const metadata = {
  title,
  description,
  keywords: [
    "web developer in Guwahati",
    "custom web application development",
    "business website development India",
    "website design Guwahati",
    "e-commerce website development",
    "website maintenance",
  ],
  alternates: { canonical: "/services" },
  openGraph: { type: "website", url: "/services", title, description, images: ogImages },
  twitter: { card: "summary_large_image", title, description, images: ogImages },
};

const reasonIcons = [UserRound, BadgeCheck, FileText, KeyRound];

/** "₹25,000" → 25000; null while the price is still a placeholder. */
function priceNumber(value) {
  const digits = (value || "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

function buildStructuredData() {
  const person = { "@id": `${site.url}/#person` };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${site.url}/services#business`,
        name: `${site.name} — Web Development Services`,
        url: `${site.url}/services`,
        description,
        image: `${site.url}/images/rubul-islam.jpg`,
        email: site.email,
        telephone: site.phoneHref.replace("tel:", ""),
        founder: person,
        address: {
          "@type": "PostalAddress",
          addressLocality: site.location.city,
          addressRegion: site.location.region,
          addressCountry: site.location.countryCode,
        },
        areaServed: { "@type": "Country", name: site.location.country },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Web development services",
          itemListElement: services.map((s) => {
            const price = SHOW_PRICES ? priceNumber(s.startingFrom) : null;
            return {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: s.title,
                description: s.outcome,
                serviceType: s.title,
                url: `${site.url}/services#${s.slug}`,
                provider: person,
                areaServed: { "@type": "Country", name: site.location.country },
              },
              ...(price && {
                priceSpecification: { "@type": "PriceSpecification", minPrice: price, priceCurrency: "INR" },
              }),
            };
          }),
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${site.url}/services#faq`,
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };
}

function SectionIntro({ eyebrow, title: heading, description: text, id }) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-subtle">{eyebrow}</p>
      <h2 id={id} className="mt-4 text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-fg sm:text-4xl">
        {heading}
      </h2>
      {text && <p className="mt-4 text-pretty text-base leading-relaxed text-muted sm:text-lg">{text}</p>}
    </div>
  );
}

export default function ServicesPage() {
  const proofItems = proof
    .map((p) => ({ ...p, project: projects.find((x) => x.slug === p.project) }))
    .filter((p) => p.project);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(buildStructuredData()) }} />

      {/* ── Hero ── */}
      <section aria-labelledby="services-title" className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="grid-bg absolute inset-0 -z-10" />
        <div
          aria-hidden="true"
          className="absolute right-[-10rem] top-[-12rem] -z-10 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,rgb(139_92_246/0.18),transparent)]"
        />
        <div className="container-x grid items-center gap-12 pb-16 pt-28 md:pt-36 lg:grid-cols-[1.25fr_1fr] lg:pb-20">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-text">Services</p>
            <h1
              id="services-title"
              className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-fg sm:text-5xl lg:text-[3.4rem]"
            >
              Websites and web apps that help your business grow.
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
              I design, build and look after websites, online stores and custom web apps for small and growing
              businesses — so you get more enquiries, bookings and sales, and spend less time on admin.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="/#contact" size="lg">
                Book a free consultation
                <ArrowRight size={18} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button href="/projects" variant="secondary" size="lg">
                See my work
              </Button>
            </div>
            <p className="mt-8 font-mono text-xs text-subtle">
              4+ years · live platforms in production · {site.location.city}, remote-friendly
            </p>
          </div>

          {/* Quick index of the four services */}
          <nav aria-label="Services on this page" className="rounded-3xl border border-line bg-card/80 p-3 shadow-card backdrop-blur">
            <ul className="divide-y divide-line">
              {services.map((s) => (
                <li key={s.slug}>
                  <a
                    href={`#${s.slug}`}
                    className="group flex items-center gap-4 rounded-2xl px-3 py-3.5 transition-colors hover:bg-card-hover"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-text">
                      <ServiceIcon name={s.icon} size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-fg">{s.title}</span>
                      <span className="block truncate text-xs text-subtle">{s.timeline}</span>
                    </span>
                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                      className="text-subtle transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-accent-text"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* ── Services ── */}
      <section aria-labelledby="what-i-offer" className="section-y border-t border-line bg-bg-2">
        <div className="container-x">
          <Reveal>
            <SectionIntro
              id="what-i-offer"
              eyebrow="What I offer"
              title="Four ways I can help."
              description="Every project starts with your goal — more enquiries, smoother operations or more sales — and the right tools are chosen for that."
            />
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {services.map((service, i) => (
              <Reveal key={service.slug} delay={(i % 2) * 80}>
                <ServiceCard service={service} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Industries ── */}
      <section aria-labelledby="industries-title" className="section-y border-t border-line">
        <div className="container-x">
          <Reveal>
            <SectionIntro
              id="industries-title"
              eyebrow="Who I work with"
              title="Built for businesses like yours."
              description="Local and growing businesses that need their website or software to bring in work, not just look nice."
            />
          </Reveal>
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {industries.map((item, i) => (
              <Reveal as="li" key={item.title} delay={i * 50}>
                <div className="flex h-full flex-col items-start gap-4 rounded-2xl border border-line bg-card p-5">
                  <span className="grid size-10 place-items-center rounded-xl border border-line bg-bg-2 text-accent-text">
                    <ServiceIcon name={item.icon} size={18} />
                  </span>
                  <span className="text-sm font-medium leading-snug text-fg">{item.title}</span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Proof ── */}
      <section aria-labelledby="proof-title" className="section-y border-t border-line bg-bg-2">
        <div className="container-x">
          <Reveal>
            <SectionIntro
              id="proof-title"
              eyebrow="Proof"
              title="Real projects, in production."
              description="Each service is backed by work you can open and use today."
            />
          </Reveal>
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {proofItems.map(({ project, label, text, service }, i) => {
              const svc = services.find((s) => s.slug === service);
              return (
                <Reveal as="li" key={project.slug} delay={(i % 2) * 80}>
                  <article className="flex h-full flex-col rounded-2xl border border-line bg-card p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-accent-text/25 bg-accent-soft px-2.5 py-1 font-mono text-[11px] text-accent-text">
                        {label}
                      </span>
                      {svc && <span className="font-mono text-[11px] text-subtle">{svc.title}</span>}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold tracking-tight text-fg">{project.title}</h3>
                    <p className="mt-2 flex-1 text-pretty text-sm leading-relaxed text-muted">{text}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                      {project.caseStudy && (
                        <Link
                          href={`/projects/${project.slug}`}
                          className="inline-flex items-center gap-1 font-medium text-fg underline decoration-line-strong underline-offset-4 hover:decoration-accent"
                        >
                          Read the case study
                          <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                      )}
                      {project.links?.live && (
                        <a
                          href={project.links.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-muted transition-colors hover:text-fg"
                        >
                          {prettyUrl(project.links.live)}
                          <ArrowUpRight size={14} aria-hidden="true" />
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── Process ── */}
      <section aria-labelledby="process-title" className="section-y border-t border-line">
        <div className="container-x">
          <Reveal>
            <SectionIntro
              id="process-title"
              eyebrow="How it works"
              title="A clear process, from first call to launch."
            />
          </Reveal>
          <ol className="relative mt-10 grid gap-4 lg:grid-cols-5 lg:gap-3">
            <span aria-hidden="true" className="absolute left-[1.15rem] top-4 bottom-4 w-px bg-line-strong lg:hidden" />
            <span aria-hidden="true" className="absolute inset-x-0 top-[1.1rem] hidden h-px bg-gradient-to-r from-accent/60 via-line-strong to-transparent lg:block" />
            {processSteps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 70} className="relative pl-12 lg:pl-0">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 grid size-9 place-items-center rounded-full border border-accent-text/40 bg-bg font-mono text-xs font-semibold text-accent-text lg:static"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="lg:mt-4 lg:rounded-2xl lg:border lg:border-line lg:bg-card lg:p-5">
                  <h3 className="text-base font-semibold tracking-tight text-fg">
                    <span className="sr-only">Step {i + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Why work with me ── */}
      <section aria-labelledby="why-title" className="section-y border-t border-line bg-bg-2">
        <div className="container-x">
          <Reveal>
            <SectionIntro id="why-title" eyebrow="Why work with me" title="Straightforward to work with." />
          </Reveal>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((r, i) => {
              const Icon = reasonIcons[i % reasonIcons.length];
              return (
                <Reveal as="li" key={r.title} delay={i * 60}>
                  <div className="h-full rounded-2xl border border-line bg-card p-6">
                    <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent-text">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold tracking-tight text-fg">{r.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{r.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      <Testimonials items={testimonials} />

      {/* ── FAQ ── */}
      <section aria-labelledby="faq-title" className="section-y border-t border-line">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <Reveal>
            <SectionIntro
              id="faq-title"
              eyebrow="FAQ"
              title="Questions businesses ask."
              description="Something else on your mind? Ask me directly — there's no obligation."
            />
          </Reveal>
          <div className="divide-y divide-line rounded-2xl border border-line bg-card">
            {faqs.map((f) => (
              <details key={f.question} className="group px-5 sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium text-fg marker:hidden [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <Plus
                    size={18}
                    aria-hidden="true"
                    className="shrink-0 text-subtle transition-transform duration-300 group-open:rotate-45 group-open:text-accent-text"
                  />
                </summary>
                <p className="-mt-1 pb-5 pr-8 text-pretty text-sm leading-relaxed text-muted">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section aria-labelledby="cta-title" className="border-t border-line">
        <div className="container-x py-16 md:py-20">
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-3xl border border-line bg-card p-8 sm:p-12">
              <div
                aria-hidden="true"
                className="absolute -right-24 -top-24 -z-10 size-80 rounded-full bg-[radial-gradient(closest-side,var(--accent-soft),transparent)]"
              />
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <h2 id="cta-title" className="text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                    Have a business idea or a problem to solve? Let&apos;s talk.
                  </h2>
                  <p className="mt-3 text-muted">
                    Tell me what you need. You&apos;ll get a reply from me within 1–2 working days.
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                  <Button href="/#contact" size="lg">
                    Book a free consultation
                    <ArrowRight size={18} aria-hidden="true" />
                  </Button>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line-strong bg-card px-6 text-[15px] font-medium text-fg transition-colors hover:border-success/50 hover:text-success"
                  >
                    <MessageCircle size={17} aria-hidden="true" />
                    WhatsApp
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
