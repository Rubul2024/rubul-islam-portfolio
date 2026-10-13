import SectionHeading from "@/components/ui/SectionHeading";
import { ogImages } from "@/lib/site";
import ProjectGrid from "@/components/projects/ProjectGrid";
import { projects, projectCategories } from "@/data/projects";

export const metadata = {
  title: "Projects",
  description:
    "Projects by Rubul Islam: MERN e-commerce and booking platforms, business and organisational websites, a React recipe app and an AI-assisted QA project.",
  alternates: { canonical: "/projects" },
  openGraph: { url: "/projects", images: ogImages },
};

export default function ProjectsPage() {
  return (
    <div className="relative isolate">
      <div aria-hidden="true" className="grid-bg absolute inset-x-0 top-0 -z-10 h-[30rem]" />
      <div className="container-x pb-24 pt-32 md:pt-40">
        <SectionHeading
          as="h1"
          eyebrow="Projects"
          title="Everything I can show you — and what each one demonstrates."
          description="Filter by type. Case studies are available for the projects with the most engineering detail; mockups are illustrative, not screenshots."
        />
        <div className="mt-12">
          <ProjectGrid projects={projects} categories={projectCategories} />
        </div>
      </div>
    </div>
  );
}
