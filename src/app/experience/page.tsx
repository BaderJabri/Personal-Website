import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Logo, Row, SectionLabel } from "@/components/summary";
import { EDUCATION, EDUCATION_NOTES, RECOGNITION, TOOLS, VOLUNTEERING, WORK, type Role } from "@/lib/experience";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Experience",
  description: "Bader Aljabri's work, education and recognition.",
  alternates: { canonical: "/experience/" },
};

function RoleCard({ r }: { r: Role }) {
  return (
    <article data-reveal className="grid gap-5 py-8 sm:grid-cols-[auto_1fr] sm:gap-x-6">
      <Logo src={r.logo} monogram={r.monogram} />
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h3 className="wide text-xl font-semibold leading-tight">{r.role}</h3>
          <p className="num font-mono text-[12px] text-pencil">{r.when}</p>
        </div>
        <p className="mt-1 text-pencil">
          {r.org}
          {r.where ? `, ${r.where}` : ""}
        </p>
        <ul className="mt-5 space-y-3">
          {r.points.map((p) => (
            <li key={p} className="relative max-w-[68ch] pl-5 leading-relaxed before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2.5 before:bg-accent">
              {p}
            </li>
          ))}
        </ul>
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
          {SITE.availability}. The full version is in my{" "}
          <a className="link text-ink" href={SITE.resumePath}>
            résumé
          </a>
          .
        </p>

        <section aria-labelledby="work-label" className="mt-14 border-t border-rule pt-8">
          <SectionLabel id="work-label">Work</SectionLabel>
          {WORK.map((r) => (
            <RoleCard key={r.org} r={r} />
          ))}
        </section>

        <section aria-labelledby="vol-label" className="mt-4 border-t border-rule pt-8">
          <SectionLabel id="vol-label">Volunteering</SectionLabel>
          {VOLUNTEERING.map((r) => (
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
          <SectionLabel id="rec-label">Recognition</SectionLabel>
          <ul className="mt-4 divide-y divide-rule">
            {RECOGNITION.map((r) => (
              <li key={r.what} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
                <span>
                  <span className="font-semibold">{r.result}</span>
                  <span className="text-pencil">, {r.what}</span>
                  {r.note && <span className="text-pencil"> ({r.note})</span>}
                </span>
                <span className="num font-mono text-[12px] text-pencil">{r.when}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="tools-label" data-reveal className="mt-12 border-t border-rule pt-8">
          <SectionLabel id="tools-label">Tools I use</SectionLabel>
          <dl className="mt-5 grid gap-6 sm:grid-cols-3 sm:gap-x-8">
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
