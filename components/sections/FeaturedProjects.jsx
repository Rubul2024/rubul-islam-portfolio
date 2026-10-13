import { ArrowRight } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { FeaturedProjectCard, ProjectCard } from "@/components/projects/ProjectCard";
import { projects } from "@/data/projects";

export default function FeaturedProjects() {
  const featured = projects.filter((p) => p.featured);
  const supporting = projects.filter((p) => !p.featured);

  return (
    <section id="projects" aria-labelledby="projects-title" className="section-y border-t border-line">
      <div className="container-x">
        <Reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="projects-title"
            index="04"
            eyebrow="Selected work"
            title="Real applications with real business logic."
            description="Production platforms, a full booking system and focused projects in frontend and QA. Visuals are illustrative mockups, not screenshots."
          />
          <Button href="/projects" variant="secondary" className="shrink-0 self-start md:self-auto">
            All projects
            <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </Reveal>

        <div className="mt-10 space-y-6 short:mt-8">
          {featured.map((project, i) => (
            <Reveal key={project.slug}>
              <FeaturedProjectCard project={project} index={i} />
            </Reveal>
          ))}
        </div>

        <h3 className="mt-14 font-mono text-xs uppercase tracking-[0.18em] text-subtle">More projects</h3>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {supporting.map((project, i) => (
            <Reveal key={project.slug} delay={(i % 2) * 80} className="h-full">
              <ProjectCard project={project} headingLevel="h4" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
