import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { PatternToy } from "@/components/client/PatternToy";
import { DemoFrame } from "@/components/demo/DemoFrame";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { PlotitSheet } from "@/components/work/PlotitSheet";
import { RibSheet } from "@/components/work/RibSheet";
import { Cover, Metrics, ProjectActions } from "@/components/work/parts";
import { getRibSession } from "@/lib/demo";
import { getAllProjects, getProject } from "@/lib/projects";

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { frontmatter: fm } = getProject(slug);
  return {
    title: fm.title,
    description: fm.summary,
    alternates: { canonical: `/projects/${slug}/` },
    openGraph: { title: `${fm.title} | Bader Aljabri`, description: fm.summary, url: `/projects/${slug}/` },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const projects = getAllProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const { frontmatter: fm, body } = projects[index];
  const next = projects[(index + 1) % projects.length];
  const rib = fm.visual === "rib" ? getRibSession() : null;

  return (
    <>
      <Nav current="projects" />
      <main id="main" className="wrap pt-10 md:pt-16">
        <Link prefetch={false} href="/projects/" className="link text-sm text-pencil">
          All projects
        </Link>

        <header className="mt-10 grid gap-10 md:grid-cols-12 md:gap-x-8">
          <div className="md:col-span-7">
            <h1 className="display project-title">{fm.title}</h1>
            <p className="mt-6 max-w-[40ch] text-lg leading-snug md:text-xl md:leading-[1.25]">{fm.summary}</p>
            <ProjectActions project={projects[index]} detail />
          </div>
          <dl className="grid content-start gap-5 text-sm md:col-span-4 md:col-start-9 md:pt-3">
            <div>
              <dt className="text-pencil">Role</dt>
              <dd className="num">
                {fm.role}, {fm.year}
                {fm.status === "in-progress" && <span className="text-accent"> (in progress)</span>}
              </dd>
            </div>
            <div>
              <dt className="text-pencil">Built with</dt>
              <dd>{fm.stack.join(", ")}</dd>
            </div>
          </dl>
        </header>

        <div className="mt-14 md:mt-20">
          {rib ? (
            <>
              <p className="mb-4 text-sm text-pencil">A replay of the drafting sequence.</p>
              <DemoFrame events={rib} />
              <RibSheet events={rib} className="mt-14" />
            </>
          ) : fm.visual === "plotit" ? (
            <>
              <p className="mb-4 text-sm text-pencil">The app&apos;s calls to the service, with sample data.</p>
              <PlotitSheet />
            </>
          ) : (
            fm.cover && <Cover cover={fm.cover} sizes="(min-width: 1200px) 1136px, 100vw" eager />
          )}
          {fm.playground === "pattern" && (
            <section aria-labelledby="try-title" className="mt-14 rounded-[10px] border border-rule p-4 sm:p-6">
              <h2 id="try-title" className="wide text-lg font-semibold">
                Pattern playground
              </h2>
              <div className="mt-6">
                <PatternToy />
              </div>
            </section>
          )}
        </div>

        <div className="project-story mx-auto mt-14 w-full max-w-[65ch] md:mt-20">
          <Metrics metrics={fm.metrics} className="mb-10 border-b border-rule pb-8" />
          <article className="prose-sheet">
            <MDXRemote source={body} />
          </article>
        </div>

        {next.slug !== slug && (
          <nav aria-label="Next project" className="mt-24 border-t border-rule pt-8 md:mt-32">
            <Link prefetch={false} href={`/projects/${next.slug}/`} className="group inline-block">
              <span className="text-sm text-pencil">Next project</span>
              <span className="display mt-2 block text-[clamp(28px,3.6vw,40px)] group-hover:text-accent">
                {next.frontmatter.title}
              </span>
            </Link>
          </nav>
        )}
      </main>
      <Footer />
    </>
  );
}
