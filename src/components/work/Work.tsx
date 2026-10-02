import Link from "next/link";
import type { Project } from "@/lib/projects";
import type { SessionEvent } from "@/lib/session-script";
import { Cover, EntryHeading, Metrics, NotesLink } from "./parts";
import { RibSheet } from "./RibSheet";

// Each project gets its own composition so the list reads as a sequence, not a grid.
// Claude × AutoCAD is shown plotted to paper here; its project page has the live replay.

function Summary({ project }: { project: Project }) {
  return <p className="mt-5 max-w-[46ch] text-pencil">{project.frontmatter.summary}</p>;
}

function SheetEntry({ project, demo }: { project: Project; demo: SessionEvent[] }) {
  return (
    <article data-reveal aria-labelledby={`${project.slug}-title`} className="grid gap-8 md:grid-cols-12 md:items-end md:gap-x-10">
      <div className="md:col-span-4">
        <EntryHeading project={project} />
        <Summary project={project} />
        <NotesLink slug={project.slug} />
      </div>
      <Link href={`/projects/${project.slug}/`} aria-hidden tabIndex={-1} className="md:col-span-8">
        <RibSheet events={demo} />
      </Link>
    </article>
  );
}

export function SplitEntry({ project, imageFirst }: { project: Project; imageFirst: boolean }) {
  const fm = project.frontmatter;
  const text = (
    <div className="md:col-span-5">
      <EntryHeading project={project} />
      <Summary project={project} />
      <Metrics metrics={fm.metrics} className="mt-8" />
      <NotesLink slug={project.slug} />
    </div>
  );
  const image = fm.cover && (
    <Link href={`/projects/${project.slug}/`} aria-hidden tabIndex={-1} className="md:col-span-7">
      <Cover cover={fm.cover} sizes="(min-width: 768px) 60vw, 100vw" />
    </Link>
  );
  return (
    <article data-reveal aria-labelledby={`${project.slug}-title`} className="grid gap-8 md:grid-cols-12 md:items-center md:gap-x-10">
      {imageFirst ? image : text}
      {imageFirst ? text : image}
    </article>
  );
}

function PlateEntry({ project }: { project: Project }) {
  const fm = project.frontmatter;
  return (
    <article data-reveal aria-labelledby={`${project.slug}-title`} className="md:mx-auto md:w-2/3">
      {fm.cover && (
        <Link href={`/projects/${project.slug}/`} aria-hidden tabIndex={-1}>
          <Cover cover={fm.cover} sizes="(min-width: 768px) 66vw, 100vw" />
        </Link>
      )}
      <div className="mt-8 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <EntryHeading project={project} />
          <Summary project={project} />
          <NotesLink slug={project.slug} />
        </div>
        <Metrics metrics={fm.metrics} className="!grid-cols-1 sm:max-w-[14rem]" />
      </div>
    </article>
  );
}

/** /work: every project with a write-up. */
export function WorkList({ projects, demo }: { projects: Project[]; demo: SessionEvent[] }) {
  const withImages = projects.filter((p) => p.slug !== "claude-autocad");
  const cad = projects.find((p) => p.slug === "claude-autocad");
  return (
    <div className="wrap flex flex-col gap-28 pt-16 md:gap-40 md:pt-24">
      {cad && <SheetEntry project={cad} demo={demo} />}
      {withImages.map((p, i) =>
        i === withImages.length - 1 && withImages.length > 2 ? (
          <PlateEntry key={p.slug} project={p} />
        ) : (
          <SplitEntry key={p.slug} project={p} imageFirst={i % 2 === 1} />
        ),
      )}
    </div>
  );
}
