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
    page("/work/", 0.9),
    ...getAllProjects().map((p) => page(`/work/${p.slug}/`, 0.8)),
    page("/about/", 0.7),
    page("/contact/", 0.5),
  ];
}
