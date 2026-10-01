import Link from "next/link";
import { ThemeToggle } from "@/components/client/ThemeToggle";
import { SITE } from "@/lib/site";

export type Page = "home" | "work" | "about" | "contact";

const LINKS: { page: Page; href: string; label: string }[] = [
  { page: "work", href: "/work/", label: "Work" },
  { page: "about", href: "/about/", label: "About" },
  { page: "contact", href: "/contact/", label: "Contact" },
];

export function Nav({ current }: { current?: Page }) {
  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-paper">
      <nav aria-label="Main" className="wrap flex h-16 items-center justify-between gap-6 text-sm">
        <Link
          href="/"
          aria-current={current === "home" ? "page" : undefined}
          className="wide font-semibold tracking-[-0.01em] hover:text-accent"
        >
          {SITE.name}
        </Link>
        <ul className="flex items-center gap-5 md:gap-8">
          {LINKS.map((l) => (
            <li key={l.page}>
              <Link
                href={l.href}
                aria-current={current === l.page ? "page" : undefined}
                className="hover:text-accent aria-[current=page]:font-semibold aria-[current=page]:text-accent"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="hidden sm:block">
            <a href={SITE.resumePath} className="hover:text-accent">
              Résumé
            </a>
          </li>
          <li className="hidden sm:block">
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </header>
  );
}
