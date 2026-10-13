import { notFound } from "next/navigation";
import { ogImages } from "@/lib/site";
import ProjectCaseStudy from "@/components/projects/ProjectCaseStudy";
import { caseStudyProjects, getProject } from "@/data/projects";

// Only projects with a written case study get a page; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudyProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project?.caseStudy) return {};

  const title = `${project.title} — ${project.subtitle}`;
  return {
    title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title,
      description: project.summary,
      url: `/projects/${project.slug}`,
      type: "article",
      images: ogImages,
    },
    twitter: { card: "summary_large_image", title, description: project.summary, images: ogImages },
  };
}

export default async function CaseStudyPage({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project?.caseStudy) notFound();

  const index = caseStudyProjects.findIndex((p) => p.slug === slug);
  const next = caseStudyProjects[(index + 1) % caseStudyProjects.length];

  return <ProjectCaseStudy project={project} next={next.slug !== slug ? next : null} />;
}
