import { CopyEmail } from "@/components/client/CopyEmail";
import { ThemeToggle } from "@/components/client/ThemeToggle";
import { SITE } from "@/lib/site";

// Every page ends with a way to reach Bader; the contact page itself drops the band.
export function Footer({ contact = true }: { contact?: boolean }) {
  return (
    <footer className="mt-28 md:mt-40">
      {contact && (
        <section aria-label="Contact" className="wrap pb-16">
          <div className="border-t border-rule pt-12">
            <p className="text-pencil">{SITE.availability}. Email is the fastest way to reach me.</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
              <a
                href={`mailto:${SITE.email}`}
                className="display break-all text-[clamp(24px,4.4vw,44px)] decoration-1 underline-offset-[0.18em] hover:text-accent hover:underline"
              >
                {SITE.email}
              </a>
              <CopyEmail email={SITE.email} />
            </div>
          </div>
        </section>
      )}
      <div className="border-t border-rule">
        <div className="wrap flex flex-col gap-4 py-8 text-xs text-pencil sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {SITE.name}</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <li>
              <a className="link" href={SITE.github}>
                GitHub
              </a>
            </li>
            <li>
              <a className="link" href={SITE.linkedin}>
                LinkedIn
              </a>
            </li>
            <li>
              <a className="link" href={SITE.resumePath}>
                Résumé
              </a>
            </li>
            <li>
              <a className="link" href={SITE.source}>
                Source
              </a>
            </li>
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
