import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-28 border-t border-rule md:mt-36">
      <div className="wrap flex flex-col gap-4 py-8 text-sm text-pencil sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 {SITE.name}</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <a className="hover:text-ink" href={SITE.github}>
              GitHub
            </a>
          </li>
          <li>
            <a className="hover:text-ink" href={SITE.linkedin}>
              LinkedIn
            </a>
          </li>
          <li>
            <a className="hover:text-ink" href={`mailto:${SITE.email}`}>
              Email
            </a>
          </li>
          <li>
            <a className="hover:text-ink" href={SITE.resumePath}>
              Résumé
            </a>
          </li>
          <li>
            <a className="hover:text-ink" href={SITE.source}>
              Source
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
