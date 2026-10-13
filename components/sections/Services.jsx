import { ArrowRight } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { ServiceCardCompact } from "@/components/services/ServiceCard";
import { services } from "@/data/services";

/** Compact services overview on the home page; full details live at /services. */
export default function Services() {
  return (
    <section id="services" aria-labelledby="services-home-title" className="section-y border-t border-line">
      <div className="container-x">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="services-home-title"
            index="03"
            eyebrow="Services"
            title="Websites and web apps for growing businesses."
            description="From a professional website that brings in enquiries to a custom system that runs your operations."
          />
          <Button href="/services" variant="secondary" className="shrink-0 self-start md:self-auto">
            View all services
            <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </Reveal>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 short:mt-8">
          {services.map((service, i) => (
            <Reveal as="li" key={service.slug} delay={i * 70}>
              <ServiceCardCompact service={service} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
