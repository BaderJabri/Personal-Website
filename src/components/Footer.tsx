import { SITE } from "@/lib/site";

/** The same destinations in every footer, in this order. */
export const FOOTER_LINKS = [
  { label: "GitHub", href: SITE.github },
  { label: "LinkedIn", href: SITE.linkedin },
  { label: "Email", href: `mailto:${SITE.email}` },
  { label: "Résumé", href: SITE.resumePath },
  { label: "Source", href: SITE.source },
];

export function Footer() {
  return (
    <footer className="mt-28 border-t border-rule md:mt-36">
      <div className="wrap flex flex-col gap-4 py-8 text-sm text-pencil sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 {SITE.name}</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((l) => (
            <li key={l.label}>
              <a className="hover:text-ink" href={l.href}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
