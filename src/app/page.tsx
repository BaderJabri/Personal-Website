import Link from "next/link";
import { ChessStatic } from "@/components/ChessStatic";
import { LazyChess } from "@/components/client/LazyChess";
import { InteractiveName } from "@/components/client/InteractiveName";
import { GitHubIcon, LinkedInIcon } from "@/components/Icons";
import { Nav } from "@/components/Nav";
import { Logo } from "@/components/summary";
import { WORK, EDUCATION, DESIGN_TEAMS } from "@/lib/experience";
import { SITE } from "@/lib/site";

export default function Home() {
  return (
    <div className="home-shell">
      <Nav current="about" />
      <main id="main" className="home-main">
        <section className="home-intro" aria-label="Introduction">
          <div>
            <p className="home-location">Waterloo, Ontario</p>
            <InteractiveName text={SITE.name} className="display home-name" />
            <div className="home-socials">
              <a href={SITE.github}>
                <GitHubIcon />
                GitHub
              </a>
              <a href={SITE.linkedin}>
                <LinkedInIcon />
                LinkedIn
              </a>
            </div>
            <p className="home-bio">
              Computer science at Waterloo, business at Laurier.
              <br className="hidden sm:block" /> I build tools for creative and technical work.
            </p>
            <div className="home-contact">
              <a href={`mailto:${SITE.email}`} className="link">
                Let&apos;s talk
              </a>
              <span>{SITE.availability}</span>
            </div>
          </div>
          <Link prefetch={false} href="/projects/" className="home-projects">
            <span className="home-projects-title">
              View my projects{" "}
              <span aria-hidden className="home-arrow">
                ↗
              </span>
            </span>
          </Link>
        </section>

        <div className="home-summary">
          <section aria-labelledby="exp-label">
            <div className="home-section-heading">
              <h2 id="exp-label">Recent experience</h2>
              <Link prefetch={false} href="/experience/" className="link">
                All experience <span aria-hidden>↗</span>
              </Link>
            </div>
            <ul className="home-rows">
              {WORK.map((r) => (
                <li key={`${r.org}-${r.short}`}>
                  <Logo src={r.logo} monogram={r.monogram} />
                  <div>
                    <p className="home-row-title">{r.org}</p>
                    <p className="home-row-note">{r.role}</p>
                  </div>
                  <span className="home-date">{r.short}</span>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="teams-label">
            <div className="home-section-heading">
              <h2 id="teams-label">Design teams</h2>
            </div>
            <ul className="home-rows">
              {DESIGN_TEAMS.map((r) => (
                <li key={r.org}>
                  <Logo src={r.logo} monogram={r.monogram} dark={r.logoDark} />
                  <div>
                    <p className="home-row-title">{r.org}</p>
                    <p className="home-row-note">{r.role}</p>
                  </div>
                  <span className="home-date">{r.short}</span>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="edu-label">
            <div className="home-section-heading">
              <h2 id="edu-label">Education</h2>
              <span>{EDUCATION[0].short}</span>
            </div>
            <ul className="home-rows">
              {EDUCATION.map((e) => (
                <li key={e.school}>
                  <Logo src={e.logo} />
                  <div>
                    <p className="home-row-title">{e.school}</p>
                    <p className="home-row-note">{e.degree}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <details className="home-chess">
          <summary>
            <span>
              Off the clock <span className="text-pencil">I play chess.</span>
            </span>
            <span className="chess-invite">
              Try a puzzle <span aria-hidden>+</span>
            </span>
          </summary>
          <div className="home-chess-content">
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
      <footer className="home-footer">
        <span>© 2026 {SITE.name}</span>
        <ul>
          <li>
            <a href={SITE.github}>GitHub</a>
          </li>
          <li>
            <a href={SITE.linkedin}>LinkedIn</a>
          </li>
          <li>
            <a href={`mailto:${SITE.email}`}>Email</a>
          </li>
          <li>
            <a href={SITE.source}>Source</a>
          </li>
        </ul>
      </footer>
    </div>
  );
}
