import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllProjects, getProject } from "@/lib/projects";

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { frontmatter, body } = getProject(slug);

  return (
    <main className="mx-auto max-w-[1100px] px-11 py-16">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-45">
        {frontmatter.status} · {frontmatter.year}
      </p>
      <h1 className="mt-4 text-4xl font-extralight tracking-tight">
        {frontmatter.title}
      </h1>
      <article className="prose mt-8 max-w-[65ch] font-light leading-relaxed">
        <MDXRemote source={body} />
      </article>
    </main>
  );
}
