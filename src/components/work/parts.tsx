import Link from "next/link";
import { GitHubIcon } from "@/components/Icons";
import type { Project, ProjectFrontmatter } from "@/lib/projects";

// Smaller encodes generated next to the large covers (see public/images/work/).
const SMALL: Record<string, string> = {
  "/images/work/tile-to-pattern.webp": "/images/work/tile-to-pattern-800.webp",
  "/images/work/whisper4windows.webp": "/images/work/whisper4windows-800.webp",
};

export function Cover({
  cover,
  sizes,
  eager = false,
  className = "",
}: {
  cover: NonNullable<ProjectFrontmatter["cover"]>;
  sizes: string;
  eager?: boolean;
  className?: string;
}) {
  const small = SMALL[cover.src];
  return (
    <span className={`cover block overflow-hidden rounded-[2px] border border-rule ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export serves pre-sized WebP files */}
      <img
        src={cover.src}
        srcSet={small ? `${small} 800w, ${cover.src} ${cover.width}w` : undefined}
        sizes={small ? sizes : undefined}
        width={cover.width}
        height={cover.height}
        alt={cover.alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="block h-auto w-full"
      />
    </span>
  );
}

export function EntryHeading({
  project,
  level = 3,
  linked = false,
}: {
  project: Project;
  level?: 2 | 3;
  linked?: boolean;
}) {
  const fm = project.frontmatter;
  const H = level === 2 ? "h2" : "h3";
  return (
    <header>
      <H id={`${project.slug}-title`} className="display text-[clamp(30px,3.6vw,40px)]">
        {linked ? (
          <Link
            prefetch={false}
            href={`/projects/${project.slug}/`}
            className="decoration-accent decoration-2 underline-offset-[0.12em] hover:text-accent hover:underline"
          >
            {fm.title}
          </Link>
        ) : (
          fm.title
        )}
      </H>
      <p className="mt-4 text-sm leading-snug">
        <span className="num block text-pencil">
          {fm.role}, {fm.year}
          {fm.status === "in-progress" && <span className="text-accent">, in progress</span>}
        </span>
      </p>
    </header>
  );
}

export function Metrics({ metrics, className = "" }: { metrics: ProjectFrontmatter["metrics"]; className?: string }) {
  if (metrics.length === 0) return null;
  return (
    <dl className={`grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 ${className}`}>
      {metrics.map((m) => (
        <div key={m.label} className="flex flex-col-reverse justify-end gap-1">
          <dt className="text-xs leading-snug text-pencil">{m.label}</dt>
          <dd className="display num text-xl">{m.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Shared, explicit destinations for the list and the project header. */
export function ProjectActions({ project, detail = false }: { project: Project; detail?: boolean }) {
  const { links, title } = project.frontmatter;
  const hasLinks = Boolean(links.live || links.github || links.download);
  if (detail && !hasLinks) return null;
  return (
    <div className="project-actions" aria-label={`${title} links`}>
      {!detail && (
        <Link
          prefetch={false}
          href={`/projects/${project.slug}/`}
          className="project-action project-action-primary"
          aria-label={`View project: ${title}`}
        >
          View project <span aria-hidden>→</span>
        </Link>
      )}
      {links.download && (
        <a
          className={`project-action ${detail ? "project-action-primary" : ""}`}
          href={links.download.href}
          download
          aria-label={`${links.download.label}: ${title}`}
        >
          {links.download.label} <span aria-hidden>↓</span>
        </a>
      )}
      {links.live && (
        <a
          className={`project-action ${detail ? "project-action-primary" : ""}`}
          href={links.live}
          aria-label={`Open in Canva: ${title}`}
        >
          Open in Canva <span aria-hidden>↗</span>
        </a>
      )}
      {links.github && (
        <a
          className={`project-action ${detail && !links.live ? "project-action-primary" : ""}`}
          href={links.github}
          aria-label={`Source code: ${title}`}
        >
          <GitHubIcon /> Source code <span aria-hidden>↗</span>
        </a>
      )}
    </div>
  );
}
