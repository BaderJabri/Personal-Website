import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Logo, Row, SectionLabel } from "@/components/summary";
import { DESIGN_TEAMS, EDUCATION, EDUCATION_NOTES, RECOGNITION, TOOLS, WORK, type Role } from "@/lib/experience";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Experience",
  description: "Bader Aljabri's work at StartUp Lab and Patterned AI, his design teams, education and recognition.",
  alternates: { canonical: "/experience/" },
};

function RoleCard({ r }: { r: Role }) {
  return (
    <article data-reveal className="grid gap-5 py-8 sm:grid-cols-[auto_1fr] sm:gap-x-6">
      <Logo src={r.logo} monogram={r.monogram} dark={r.logoDark} />
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h3 className="wide text-xl font-semibold leading-tight">{r.role}</h3>
          <p className="num font-mono text-[12px] text-pencil">{r.when}</p>
        </div>
        <p className="mt-1 text-pencil">
          <span className="font-semibold text-ink">{r.org}</span>
          {r.about ? `, ${r.about}` : ""}
          {r.where ? `. ${r.where}` : ""}
          {r.link && (
            <>
              {". "}
              <a className="link" href={r.link.href}>
                {r.link.label}
              </a>
            </>
          )}
        </p>
        {r.note && <p className="mt-4 max-w-[68ch] leading-relaxed">{r.note}</p>}
        {r.points.length > 0 && (
          <ul className="mt-5 space-y-3">
            {r.points.map((p) => (
              <li
                key={p}
                className="relative max-w-[68ch] pl-5 leading-relaxed before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2.5 before:bg-accent"
              >
                {p}
              </li>
            ))}
          </ul>
        )}
        {r.tools && (
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tools">
            {r.tools.map((t) => (
              <li key={t} className="rounded-full border border-rule px-3 py-1 text-[13px] text-pencil">
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export default function ExperiencePage() {
  return (
    <>
      <Nav current="experience" />
      <main id="main" className="narrow pt-14 md:pt-24">
        <h1 className="display text-[clamp(46px,8.4vw,76px)]">Experience</h1>
        <p className="mt-6 max-w-[48ch] text-lg leading-snug text-pencil">
          {SITE.availability}.{" "}
          <a className="link text-ink" href={SITE.resumePath}>
            Résumé ↗
          </a>
        </p>

        <section aria-labelledby="work-label" className="mt-14 border-t border-rule pt-8">
          <SectionLabel id="work-label">Work</SectionLabel>
          {WORK.map((r) => (
            <RoleCard key={`${r.org}-${r.when}`} r={r} />
          ))}
        </section>

        <section aria-labelledby="teams-label" className="mt-4 border-t border-rule pt-8">
          <SectionLabel id="teams-label">Design teams</SectionLabel>
          {DESIGN_TEAMS.map((r) => (
            <RoleCard key={r.org} r={r} />
          ))}
        </section>

        <section aria-labelledby="edu-label" data-reveal className="mt-4 border-t border-rule pt-8">
          <SectionLabel id="edu-label">Education</SectionLabel>
          <ul className="mt-3">
            {EDUCATION.map((e) => (
              <Row key={e.school} logo={<Logo src={e.logo} />} title={e.degree} sub={e.school} right={e.short} />
            ))}
          </ul>
          <ul className="mt-4 space-y-2 text-[15px] text-pencil">
            {EDUCATION_NOTES.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="rec-label" data-reveal className="mt-12 border-t border-rule pt-8">
          <SectionLabel id="rec-label">Competitions and certifications</SectionLabel>
          <ul className="mt-4 divide-y divide-rule">
            {RECOGNITION.map((r) => (
              <li
                key={`${r.what}-${r.when}`}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3"
              >
                <span>
                  <span className="font-semibold">{r.result}</span>
                  <span className="text-pencil">, {r.what}</span>
                </span>
                {r.when && <span className="num font-mono text-[12px] text-pencil">{r.when}</span>}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="tools-label" data-reveal className="mt-12 border-t border-rule pt-8">
          <SectionLabel id="tools-label">Skills</SectionLabel>
          <dl className="mt-5 grid gap-6 sm:grid-cols-2 sm:gap-x-10">
            {TOOLS.map((t) => (
              <div key={t.group}>
                <dt className="text-sm text-pencil">{t.group}</dt>
                <dd className="mt-1 leading-snug">{t.list}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
      <Footer />
    </>
  );
}
