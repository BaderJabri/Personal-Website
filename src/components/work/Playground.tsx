import type { Project } from "@/lib/projects";
import { EntryHeading, Metrics, NotesLink } from "./parts";

// A home-page section for a project you can try right here: its heading and real numbers,
// then a live, pocket-sized version of the thing itself.
export function ToySection({ id, project, children }: { id: string; project: Project; children: React.ReactNode }) {
  const fm = project.frontmatter;
  return (
    <section id={id} aria-labelledby={`${project.slug}-title`} className="wrap scroll-mt-24 pt-28 md:pt-40">
      <div data-reveal className="grid gap-8 md:grid-cols-12 md:items-end md:gap-x-10">
        <div className="md:col-span-7">
          <EntryHeading project={project} />
          <p className="mt-5 max-w-[46ch] text-pencil">{fm.summary}</p>
        </div>
        <Metrics metrics={fm.metrics} className="md:col-span-5" />
      </div>
      <div data-reveal style={{ "--d": "120ms" } as React.CSSProperties} className="mt-10 rounded-[2px] border border-rule p-4 sm:p-6">
        <p className="mb-6 text-xs text-pencil">Try it. This is a small working version that runs in your browser.</p>
        {children}
      </div>
      <NotesLink slug={project.slug} />
    </section>
  );
}
