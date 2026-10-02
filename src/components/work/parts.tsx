import Link from "next/link";
import { CountUp } from "@/components/client/CountUp";
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

export function EntryHeading({ project, level = 3, linked = false }: { project: Project; level?: 2 | 3; linked?: boolean }) {
  const fm = project.frontmatter;
  const H = level === 2 ? "h2" : "h3";
  return (
    <header>
      <H id={`${project.slug}-title`} className="display text-[clamp(30px,3.6vw,40px)]">
        {linked ? (
          <Link href={`/projects/${project.slug}/`} className="decoration-accent decoration-2 underline-offset-[0.12em] hover:text-accent hover:underline">
            {fm.transform}
          </Link>
        ) : (
          fm.transform
        )}
      </H>
      <p className="mt-4 text-sm leading-snug">
        <span className="block font-semibold">{fm.title}</span>
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
          <dd className="display num text-xl">
            <CountUp value={m.value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** The obvious way into a project's page: a filled button, not a quiet text link. */
export function NotesLink({ slug, title }: { slug: string; title: string }) {
  return (
    <Link href={`/projects/${slug}/`} className="pill mt-7" aria-label={`View project: ${title}`}>
      View project
    </Link>
  );
}
