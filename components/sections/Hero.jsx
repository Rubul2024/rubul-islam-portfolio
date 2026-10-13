import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Briefcase, Download, MapPin } from "lucide-react";
import Button from "@/components/ui/Button";
import TechMarquee from "@/components/sections/TechMarquee";
import { site } from "@/lib/site";
import { projects } from "@/data/projects";
import portrait from "@/public/images/rubul-islam.jpg";

// Only verifiable numbers: years from the work history, counts from data/projects.js.
const liveCount = projects.filter((p) => /^live/i.test(p.status)).length;
const stats = [
  { value: "4+", label: "Years building for the web" },
  { value: String(liveCount), label: "Live platforms in production" },
  { value: String(projects.length), label: "Projects showcased" },
];

export default function Hero({ resumeAvailable }) {
  return (
    <section id="home" aria-labelledby="hero-title" className="relative isolate flex flex-col overflow-hidden lg:min-h-[100svh]">
      <div aria-hidden="true" className="grid-bg absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="absolute right-[-10rem] top-[-12rem] -z-10 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(closest-side,rgb(139_92_246/0.18),transparent)]"
      />

      <div className="container-x grid flex-1 items-center gap-12 pb-16 pt-28 md:pt-32 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:pb-14 lg:pt-28 short:pb-10 short:pt-24">
        {/* Portrait — first on mobile so visitors see who they're talking to */}
        <div className="relative mx-auto w-full max-w-[19rem] sm:max-w-sm lg:order-last lg:mr-0 lg:max-w-[min(100%,calc((100svh-15rem)*0.8))]">
          <div
            aria-hidden="true"
            className="absolute -inset-6 -z-10 rounded-[3rem] bg-[radial-gradient(closest-side,rgb(139_92_246/0.28),transparent)] blur-2xl"
          />
          <div className="relative overflow-hidden rounded-[2rem] border border-line-strong bg-card shadow-card">
            <Image
              src={portrait}
              alt={`${site.name}, ${site.role}`}
              placeholder="blur"
              preload
              sizes="(min-width: 1024px) 34rem, (min-width: 640px) 24rem, 19rem"
              className="aspect-[4/5] w-full object-cover object-[50%_18%]"
            />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />
          </div>

          {/* Floating detail cards */}
          <div className="absolute -bottom-5 left-1/2 flex w-max -translate-x-1/2 items-center gap-3 rounded-2xl border border-line-strong bg-card/90 px-4 py-3 shadow-card backdrop-blur-xl sm:left-auto sm:right-[-1rem] sm:translate-x-0 lg:right-[-1.5rem]">
            <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent-text">
              <Briefcase size={17} aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Currently</span>
              <span className="block text-sm font-medium text-fg">Full Stack Developer · Indilens</span>
            </span>
          </div>
          <div className="absolute left-[-0.75rem] top-6 hidden rounded-full border border-line-strong bg-card/90 px-3.5 py-2 font-mono text-[11px] text-fg shadow-card backdrop-blur-xl sm:block lg:left-[-1.5rem]">
            <span className="text-accent-text">{"</>"}</span> MERN Stack
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              Available for work
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted">
              <MapPin size={13} aria-hidden="true" />
              {site.location.city}, {site.location.country}
            </span>
          </div>

          <h1 id="hero-title" className="mt-6 short:mt-4">
            <span className="block text-sm font-medium text-muted sm:text-base">Hi, I&apos;m</span>
            {/* One line at every width: the size follows the column width so it never wraps */}
            <span className="mt-2 block whitespace-nowrap text-[clamp(2.25rem,12.5vw,4.75rem)] font-semibold uppercase leading-[0.95] tracking-[-0.04em] text-fg lg:text-[clamp(3rem,5.4vw,5.25rem)]">
              Rubul Islam
            </span>
            <span className="mt-4 block bg-gradient-to-r from-fg via-accent-text to-blue bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-3xl short:text-2xl">
              Full Stack Developer (MERN)
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg short:mt-4 short:text-base">
            I build digital products that solve real-world problems — responsive interfaces, robust REST APIs and
            MongoDB-backed applications, from the first mockup to a live, maintained website.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center short:mt-6">
            <Button href="/#projects" size="lg">
              Explore my work
              <ArrowRight size={18} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button href="/#contact" variant="secondary" size="lg">
              Let&apos;s work together
            </Button>
            {resumeAvailable && (
              <Button href={site.resumePath} download="Rubul-Islam-Resume.pdf" variant="ghost" size="lg" className="px-3">
                <Download size={17} aria-hidden="true" />
                Resume
              </Button>
            )}
          </div>
          <Link
            href="/services"
            className="group mt-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
          >
            Need a website or web app for your business?
            <span className="text-accent-text transition-transform group-hover:translate-x-0.5" aria-hidden="true">
              →
            </span>
          </Link>

          <dl className="mt-9 grid max-w-lg grid-cols-3 divide-x divide-line border-t border-line pt-5 short:mt-7 short:pt-4">
            {stats.map((s) => (
              <div key={s.label} className="px-3 first:pl-0 sm:px-5">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block text-3xl font-semibold tracking-tight text-fg tabular-nums sm:text-4xl short:text-3xl">{s.value}</span>
                  <span aria-hidden="true" className="mt-1 block text-xs leading-snug text-subtle sm:text-[13px]">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <TechMarquee />
    </section>
  );
}
