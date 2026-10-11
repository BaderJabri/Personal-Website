import Link from "next/link";
import { ChessStatic } from "@/components/ChessStatic";
import { LazyChess } from "@/components/client/LazyChess";
import { InteractiveName } from "@/components/client/InteractiveName";
import { FOOTER_LINKS } from "@/components/Footer";
import { GitHubIcon, LinkedInIcon } from "@/components/Icons";
import { Nav } from "@/components/Nav";
import { Logo } from "@/components/summary";
import { WORK, EDUCATION, DESIGN_TEAMS, type Role } from "@/lib/experience";
import { SITE } from "@/lib/site";

// One 760px reading column for the whole page; the arrow and the plus share one motion.
const column = "mx-auto w-[min(100%,760px)] px-6 md:px-7";
const arrow = "ml-2 inline-block transition-transform duration-[450ms] ease-[var(--ease-out)]";

function HomeSection({
  id,
  title,
  aside,
  children,
}: {
  id: string;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="border-t border-rule pt-5">
      <div className="flex items-baseline justify-between gap-3 text-[13px] text-pencil">
        <h2 id={id} className="text-[14px] font-semibold text-ink">
          {title}
        </h2>
        {aside}
      </div>
      <ul className="mt-4 grid gap-5 md:gap-4">{children}</ul>
    </section>
  );
}

// On narrow screens the date drops under the text and the logo spans both lines.
function HomeRow({ logo, title, note, date }: { logo: React.ReactNode; title: string; note: string; date?: string }) {
  return (
    <li className="grid grid-cols-[36px_minmax(0,1fr)] items-center gap-x-3 gap-y-0.5 md:grid-cols-[36px_minmax(0,1fr)_auto] md:gap-3">
      {logo}
      <div>
        <p className="text-[14px] leading-[1.4] font-semibold">{title}</p>
        <p className="text-[13px] leading-[1.4] text-pencil">{note}</p>
      </div>
      {date && <span className="whitespace-nowrap text-[12px] text-pencil max-md:col-start-2">{date}</span>}
    </li>
  );
}

function RoleRows({ roles }: { roles: Role[] }) {
  return roles.map((r) => (
    <HomeRow
      key={`${r.org}-${r.short}`}
      logo={<Logo small className="max-md:row-span-2" src={r.logo} monogram={r.monogram} dark={r.logoDark} />}
      title={`${r.role}, ${r.org}`}
      note={r.highlight}
      date={r.short}
    />
  ));
}

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      <Nav current="about" />
      <main id="main" className={`${column} flex-none pt-[clamp(36px,6vh,60px)]`}>
        <section aria-label="Introduction">
          <div>
            <p className="mb-3 text-[13px] text-pencil">Waterloo, Ontario</p>
            <InteractiveName
              text={SITE.name}
              className="display whitespace-nowrap text-[clamp(30px,8.8vw,54px)] md:text-[clamp(32px,6vw,60px)]"
            />
            <div className="mt-4 flex gap-[18px]">
              <a
                href={SITE.github}
                className="inline-flex min-h-8 items-center gap-[7px] text-[13px] text-pencil hover:text-accent"
              >
                <GitHubIcon />
                GitHub
              </a>
              <a
                href={SITE.linkedin}
                className="inline-flex min-h-8 items-center gap-[7px] text-[13px] text-pencil hover:text-accent"
              >
                <LinkedInIcon />
                LinkedIn
              </a>
            </div>
            <p className="mt-4 text-[17px] leading-[1.55] text-pencil">
              Double degree in computer science at Waterloo and business at Laurier.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-pencil">
              <a href={`mailto:${SITE.email}`} className="link text-[14px] font-semibold text-accent">
                Let&apos;s talk
              </a>
              <span>{SITE.availability}</span>
            </div>
          </div>
          <Link
            prefetch={false}
            href="/projects/"
            className="group mt-5 inline-flex min-h-11 items-center rounded-[5px] bg-accent px-[18px] py-2.5 text-paper hover:bg-[color-mix(in_oklab,var(--accent)_85%,var(--ink))]"
          >
            <span className="text-[16px] font-semibold">
              View my projects{" "}
              <span aria-hidden className={`${arrow} group-hover:translate-x-[3px] group-hover:-translate-y-[3px]`}>
                ↗
              </span>
            </span>
          </Link>
        </section>

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-9 md:gap-8">
          <HomeSection
            id="exp-label"
            title="Recent experience"
            aside={
              <Link prefetch={false} href="/experience/" className="link">
                All experience <span aria-hidden>↗</span>
              </Link>
            }
          >
            <RoleRows roles={WORK} />
          </HomeSection>
          <HomeSection id="teams-label" title="Design teams">
            <RoleRows roles={DESIGN_TEAMS} />
          </HomeSection>
          <HomeSection id="edu-label" title="Education" aside={<span>{EDUCATION[0].short}</span>}>
            {EDUCATION.map((e) => (
              <HomeRow
                key={e.school}
                logo={<Logo small className="max-md:row-span-2" src={e.logo} />}
                title={e.school}
                note={e.degree}
              />
            ))}
          </HomeSection>
        </div>

        <details className="group mt-9 border-t border-rule md:mt-8">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-[12px] max-[359px]:gap-2 [&::-webkit-details-marker]:hidden">
            <span>
              Off the clock <span className="ml-2 text-pencil max-[359px]:ml-1">I play chess.</span>
            </span>
            <span className="whitespace-nowrap text-accent">
              Try a puzzle{" "}
              <span aria-hidden className={`${arrow} group-open:rotate-45`}>
                +
              </span>
            </span>
          </summary>
          <div className="pb-8 pt-4">
            <LazyChess fallback={<ChessStatic />} />
            <p className="mt-4 text-xs text-pencil">
              Puzzles from the{" "}
              <a className="link" href="https://database.lichess.org/#puzzles">
                Lichess puzzle database
              </a>{" "}
              (CC0).
            </p>
          </div>
        </details>
      </main>
      <footer
        className={`${column} mt-10 flex flex-wrap justify-between gap-3 py-6 text-[12px] text-pencil md:flex-nowrap`}
      >
        <span>© 2026 {SITE.name}</span>
        <ul className="flex flex-wrap gap-4">
          {FOOTER_LINKS.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="hover:text-accent">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}
