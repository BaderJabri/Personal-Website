import Link from "next/link";
import { ThemeSwitch } from "@/components/client/ThemeSwitch";
import { SITE } from "@/lib/site";

export type Page = "about" | "projects" | "experience" | "chess";

const LINKS: { page: Page; href: string; label: string }[] = [
  { page: "about", href: "/", label: "About" },
  { page: "projects", href: "/projects/", label: "Projects" },
  { page: "experience", href: "/experience/", label: "Experience" },
  { page: "chess", href: "/chess/", label: "Chess" },
];

export function Nav({ current }: { current?: Page }) {
  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-paper/90 backdrop-blur-sm">
      <nav aria-label="Main" className="wrap flex h-16 items-center justify-between gap-4 text-sm">
        <Link href="/" className="wide hidden font-semibold tracking-[-0.01em] hover:text-accent sm:block">
          {SITE.name}
        </Link>
        <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end sm:gap-7">
          <ul className="flex items-center gap-4 sm:gap-7">
            {LINKS.map((l) => (
              <li key={l.page}>
                <Link
                  href={l.href}
                  aria-current={current === l.page ? "page" : undefined}
                  className="text-pencil hover:text-ink aria-[current=page]:font-semibold aria-[current=page]:text-ink"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="hidden md:block">
              <a href={SITE.resumePath} className="text-pencil hover:text-ink">
                Résumé
              </a>
            </li>
          </ul>
          <ThemeSwitch />
        </div>
      </nav>
    </header>
  );
}
