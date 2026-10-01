import { OG_SIZE, ogImage } from "@/lib/og";
import { getAllProjects, getProject } from "@/lib/projects";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Project card for Bader Aljabri's portfolio";

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { frontmatter: fm } = getProject(slug);
  return ogImage({ kicker: `${fm.title}, ${fm.year}`, title: fm.transform, subtitle: fm.summary });
}
