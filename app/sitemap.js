import { site } from "@/lib/site";
import { caseStudyProjects } from "@/data/projects";
import { getPublishedSlugs } from "@/lib/blog/posts";

export const revalidate = 3600;

export default async function sitemap() {
  const now = new Date();
  const posts = await getPublishedSlugs();
  return [
    { url: `${site.url}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/projects`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...caseStudyProjects.map((p) => ({
      url: `${site.url}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: `${site.url}/blog/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];
}
