import { Boxes, Globe, Bug, Sparkles } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

const focusAreas = [
  {
    icon: Boxes,
    title: "Full stack MERN apps",
    text: "React interfaces, Express APIs, MongoDB models and authentication as one product.",
  },
  {
    icon: Globe,
    title: "WordPress websites",
    text: "Client sites from mockups, customised with Elementor and WPBakery, and maintained.",
  },
  {
    icon: Bug,
    title: "Debugging & performance",
    text: "Frontend and backend fixes, page speed, SEO structure and mobile layouts.",
  },
  {
    icon: Sparkles,
    title: "AI-assisted dev & testing",
    text: "GitHub Copilot and generative AI tools for development and structured testing.",
  },
];

const facts = [
  { label: "Based in", value: "Guwahati, Assam, India" },
  { label: "Currently", value: "Full Stack Developer, Indilens Web Solutions" },
  { label: "Education", value: "MCA & BCA, Cotton University" },
  { label: "Experience", value: "4+ years building for the web" },
];

const workSteps = [
  {
    title: "Understand the goal",
    text: "Users, content, budget and deadline first — then the right tools.",
  },
  {
    title: "Build it properly",
    text: "Clean, responsive interfaces and well-structured APIs, shared early.",
  },
  {
    title: "Launch and look after it",
    text: "Testing, deployment, speed and SEO — and support after go-live.",
  },
];

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="section-y border-t border-line">
      <div className="container-x grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <Reveal>
          <SectionHeading
            id="about-title"
            index="01"
            eyebrow="About"
            title="A developer focused on building useful software."
          />
          <div className="mt-6 space-y-4 text-pretty text-base leading-relaxed text-muted short:text-[15px]">
            <p>
              I&apos;m a full stack developer from Guwahati with more than four years of hands-on web development. At
              Indilens Web Solutions I build and maintain client websites — turning design mockups into responsive pages,
              customising WordPress, and keeping sites fast, secure and up to date.
            </p>
            <p>
              Alongside that, I build MERN applications end to end:{" "}
              <span className="text-fg">React interfaces, Express REST APIs, MongoDB data models and authentication</span>{" "}
              — from an e-commerce platform with a referral-based distributor network to a booking system with
              server-side pricing.
            </p>
          </div>

          <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 short:mt-6">
            {facts.map((f) => (
              <div key={f.label} className="bg-bg-2 px-4 py-2.5">
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">{f.label}</dt>
                <dd className="mt-1 text-sm text-fg">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-subtle">What I work on</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {focusAreas.map(({ icon: Icon, title, text }, i) => (
              <Reveal as="li" key={title} delay={i * 60}>
                <div className="group h-full rounded-2xl border border-line bg-card p-4 transition-colors hover:border-line-strong hover:bg-card-hover">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-bg-2 text-accent-text transition-colors group-hover:border-accent/40">
                      <Icon size={17} aria-hidden="true" />
                    </span>
                    <h3 className="text-[15px] font-medium leading-snug text-fg">{title}</h3>
                  </div>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-muted">{text}</p>
                </div>
              </Reveal>
            ))}
          </ul>

          <p className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-subtle short:mt-6">How I work</p>
          <ol className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
            {workSteps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 70} className="flex items-baseline gap-4 px-5 py-3 short:py-2.5">
                <span aria-hidden="true" className="w-7 shrink-0 font-mono text-xl font-semibold text-accent-text/80">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-relaxed text-muted">
                  <span className="font-medium text-fg">{step.title}.</span> {step.text}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
