import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/projects";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number) => ({
    url: `${SITE.baseUrl}${path}`,
    changeFrequency: "monthly" as const,
    priority,
  });
  return [
    page("/", 1),
    page("/projects/", 0.9),
    ...getAllProjects().map((p) => page(`/projects/${p.slug}/`, 0.8)),
    page("/experience/", 0.7),
  ];
}
