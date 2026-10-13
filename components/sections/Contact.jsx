import Image from "next/image";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import CopyButton from "@/components/ui/CopyButton";
import { SocialIconLinks } from "@/components/ui/SocialLinks";
import ContactForm from "@/components/sections/ContactForm";
import { site, whatsappHref } from "@/lib/site";
import avatar from "@/public/images/rubul-islam-avatar.jpg";

/** Messages are saved to the database (admin inbox) and/or emailed via Resend. */
export function isDeliveryConfigured() {
  return Boolean(process.env.MONGODB_URI || (process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL));
}

const methods = [
  { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}`, copy: site.email },
  { icon: Phone, label: "Phone / WhatsApp", value: site.phoneDisplay, href: site.phoneHref, copy: site.phoneDisplay },
  {
    icon: MapPin,
    label: "Based in",
    value: `${site.location.city}, ${site.location.region}, ${site.location.country}`,
    note: "Remote-friendly · IST (UTC+5:30)",
  },
];

export default function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="section-y relative isolate overflow-hidden border-t border-line">
      <div
        aria-hidden="true"
        className="absolute bottom-[-22rem] left-1/2 -z-10 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(139_92_246/0.14),transparent)]"
      />

      <div className="container-x">
        {/* Heading */}
        <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-subtle">
              <span className="text-accent-text">07</span>
              <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
              Contact
            </p>
            <h2
              id="contact-title"
              className="mt-4 text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-fg sm:text-4xl md:text-[2.5rem] short:mt-3 short:text-[2.15rem]"
            >
              Have a project in mind? <span className="text-muted">Let&apos;s talk.</span>
            </h2>
          </div>
          <p className="max-w-sm text-pretty text-[15px] leading-relaxed text-muted md:text-right">
            Open to full-time roles, freelance projects and business websites — tell me what you need.
          </p>
        </Reveal>

        {/* One card: details on the left, form on the right */}
        <Reveal delay={80} className="mt-8 short:mt-6">
          <div className="grid overflow-hidden rounded-3xl border border-line bg-card shadow-card lg:grid-cols-[0.85fr_1.15fr]">
            {/* ── Details ── */}
            <aside className="relative isolate flex flex-col gap-6 border-b border-line bg-bg-2 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-7 short:gap-5 short:py-6">
              <div
                aria-hidden="true"
                className="absolute -left-24 -top-24 -z-10 size-72 rounded-full bg-[radial-gradient(closest-side,var(--accent-soft),transparent)]"
              />

              {/* Profile + availability */}
              <div className="flex items-center gap-4">
                <span className="relative shrink-0">
                  <Image
                    src={avatar}
                    alt={site.name}
                    width={56}
                    height={56}
                    className="size-14 rounded-2xl border border-line-strong object-cover"
                  />
                  <span aria-hidden="true" className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-bg-2">
                    <span className="size-2.5 rounded-full bg-success" />
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-fg">{site.name}</p>
                  <p className="text-sm text-muted">{site.role}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
                  <span className="size-1.5 rounded-full bg-success" />
                  Available for work
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted">
                  <Clock size={12} aria-hidden="true" />
                  Replies in 1–2 days
                </span>
              </div>

              {/* Contact methods */}
              <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card/60">
                {methods.map(({ icon: Icon, label, value, href, copy, note }) => (
                  <li key={label} className="flex items-center gap-3 px-4 py-3 short:py-2.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-text">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">{label}</p>
                      {href ? (
                        <a href={href} className="block truncate text-[15px] text-fg transition-colors hover:text-accent-text">
                          {value}
                        </a>
                      ) : (
                        <p className="truncate text-[15px] text-fg">{value}</p>
                      )}
                      {note && <p className="text-xs text-subtle">{note}</p>}
                    </div>
                    {copy && <CopyButton value={copy} label={label.toLowerCase()} />}
                  </li>
                ))}
              </ul>

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line-strong bg-card text-sm font-medium text-fg transition-colors hover:border-success/50 hover:text-success"
                >
                  <MessageCircle size={16} aria-hidden="true" /> WhatsApp
                </a>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line-strong bg-card text-sm font-medium text-fg transition-colors hover:border-accent-text/50 hover:text-accent-text"
                >
                  <Mail size={16} aria-hidden="true" /> Email me
                </a>
              </div>

              {/* Socials */}
              <div className="mt-auto flex items-center justify-between gap-4 border-t border-line pt-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">Find me online</p>
                <SocialIconLinks size={17} />
              </div>
            </aside>

            {/* ── Form ── */}
            <div className="p-6 sm:p-8 lg:p-7 short:py-6">
              <div className="mb-5 short:mb-4">
                <h3 className="text-xl font-semibold tracking-tight text-fg">Send a message</h3>
                <p className="mt-1 text-sm text-muted lg:hidden">Takes under a minute. I&apos;ll reply to you personally.</p>
              </div>
              <ContactForm email={site.email} deliveryConfigured={isDeliveryConfigured()} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
