import Link from "next/link";
import { ChessStatic } from "@/components/ChessStatic";
import { LazyChess } from "@/components/client/LazyChess";
import { InteractiveName } from "@/components/client/InteractiveName";
import { LocalTime } from "@/components/client/LocalTime";
import { Footer } from "@/components/Footer";
import { GitHubIcon, LinkedInIcon, MailIcon } from "@/components/Icons";
import { Nav } from "@/components/Nav";
import { Logo, Row, SectionLabel } from "@/components/summary";
import { DESIGN_TEAMS, EDUCATION, WORK } from "@/lib/experience";
import { SITE } from "@/lib/site";

const Sep = () => (
  <span aria-hidden className="hidden h-4 w-px bg-rule sm:block">
    {" "}
  </span>
);

export default function Home() {
  return (
    <>
      <Nav current="about" />
      <main id="main" className="narrow pt-14 md:pt-24">
        <InteractiveName
          text={SITE.name}
          className="display touch-pan-y select-none text-[clamp(48px,9.4vw,92px)] leading-[0.95]"
        />

        <div data-reveal className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px]">
          <span className="font-semibold text-accent">CS + BBA at Waterloo &amp; Laurier</span>
          <Sep />
          <span className="text-pencil">
            Waterloo, ON <span aria-hidden>·</span> <LocalTime />
          </span>
          <Sep />
          <span className="flex items-center gap-1">
            <a href={SITE.linkedin} aria-label="LinkedIn" className="icon-link">
              <LinkedInIcon />
            </a>
            <a href={SITE.github} aria-label="GitHub" className="icon-link">
              <GitHubIcon />
            </a>
            <a href={`mailto:${SITE.email}`} aria-label={`Email ${SITE.email}`} className="icon-link">
              <MailIcon />
            </a>
          </span>
        </div>

        <p data-reveal style={{ "--d": "80ms" } as React.CSSProperties} className="mt-6 max-w-[58ch] text-lg leading-[1.55] text-pencil">
          Computer science and business student. I build software that turns{" "}
          <span className="text-ink">prompts into parts, tiles into patterns, and speech into text.</span>
        </p>

        <section aria-labelledby="exp-label" data-reveal className="mt-12 border-t border-rule pt-8">
          <SectionLabel id="exp-label">Recent experience</SectionLabel>
          <ul className="mt-3">
            <Row
              logo={<Logo monogram="W27" dashed />}
              title="Winter 2027 co-op"
              sub="Looking for my next team"
              right="Open"
              rightTone="accent"
            />
            {WORK.slice(0, 2).map((r) => (
              <Row
                key={`${r.org}-${r.short}`}
                logo={<Logo src={r.logo} monogram={r.monogram} dark={r.logoDark} />}
                title={r.role}
                sub={r.org}
                right={r.short}
              />
            ))}
          </ul>
          <Link href="/experience/" className="link mt-3 inline-block text-sm text-pencil">
            All experience
          </Link>
        </section>

        <section aria-labelledby="teams-label" data-reveal className="mt-10 border-t border-rule pt-8">
          <SectionLabel id="teams-label">Design teams</SectionLabel>
          <ul className="mt-3">
            {DESIGN_TEAMS.map((r) => (
              <Row
                key={r.org}
                logo={<Logo src={r.logo} monogram={r.monogram} dark={r.logoDark} />}
                title={r.role}
                sub={`${r.org}, ${r.about}`}
                right={r.short}
              />
            ))}
          </ul>
        </section>

        <section aria-labelledby="edu-label" data-reveal className="mt-10 border-t border-rule pt-8">
          <SectionLabel id="edu-label">Education</SectionLabel>
          <ul className="mt-3">
            {EDUCATION.map((e) => (
              <Row key={e.school} logo={<Logo src={e.logo} />} title={e.degree} sub={e.school} right={e.short} />
            ))}
          </ul>
        </section>

        <section aria-labelledby="proj-label" data-reveal className="mt-10 border-t border-rule pt-8">
          <SectionLabel id="proj-label">Projects</SectionLabel>
          <Link href="/projects/" className="card group mt-5 flex items-center justify-between gap-6 p-5 sm:p-6">
            <span>
              <span className="display block text-xl">View my projects</span>
              <span className="mt-1 block text-[15px] text-pencil">
                Claude × AutoCAD, Tile To Pattern, Whisper4Windows and more
              </span>
            </span>
            <span className="pill shrink-0">Open</span>
          </Link>
        </section>

        <section aria-labelledby="chess-label" data-reveal className="mt-10 border-t border-rule pt-8">
          <SectionLabel id="chess-label">Off the clock</SectionLabel>
          <p className="mt-4 max-w-[60ch] text-[15px] text-pencil">
            I play a lot of chess. Here&apos;s a puzzle from a real game; solve it and the next one gets harder.
          </p>
          <div className="mt-6">
            <LazyChess fallback={<ChessStatic />} />
          </div>
          <p className="mt-6 text-xs text-pencil">
            Puzzles from the{" "}
            <a className="link" href="https://database.lichess.org/#puzzles">
              Lichess puzzle database
            </a>{" "}
            (CC0).
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
