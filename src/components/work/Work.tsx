import Link from "next/link";
import type { Project } from "@/lib/projects";
import type { SessionEvent } from "@/lib/session-script";
import { Cover, EntryHeading, Metrics, ProjectActions } from "./parts";
import { PlotitSheet } from "./PlotitSheet";
import { RibSheet } from "./RibSheet";

export function WorkList({ projects, demo }: { projects: Project[]; demo: SessionEvent[] }) {
  return (
    <div className="wrap project-list">
      {projects.map((project) => (
        <article key={project.slug} aria-labelledby={`${project.slug}-title`} className="project-entry">
          <div className="project-entry-copy">
            <EntryHeading project={project} />
            <p className="project-summary">{project.frontmatter.summary}</p>
            <Metrics metrics={project.frontmatter.metrics} className="mt-7" />
            <ProjectActions project={project} />
          </div>
          <Link
            prefetch={false}
            href={`/projects/${project.slug}/`}
            aria-hidden
            tabIndex={-1}
            className="project-media"
          >
            {project.frontmatter.visual === "rib" ? (
              <RibSheet events={demo} />
            ) : project.frontmatter.visual === "plotit" ? (
              <PlotitSheet />
            ) : project.frontmatter.cover ? (
              <Cover
                cover={project.frontmatter.cover}
                sizes="(min-width: 1200px) 650px, (min-width: 768px) 56vw, 100vw"
              />
            ) : null}
          </Link>
        </article>
      ))}
    </div>
  );
}
