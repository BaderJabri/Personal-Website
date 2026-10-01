import type { Metadata } from "next";
import { CopyEmail } from "@/components/client/CopyEmail";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `${SITE.availability}. Email Bader Aljabri at ${SITE.email}.`,
  alternates: { canonical: "/contact/" },
};

const ELSEWHERE = [
  { label: "GitHub", href: SITE.github, detail: "github.com/BaderJabri" },
  { label: "LinkedIn", href: SITE.linkedin, detail: "linkedin.com/in/baderaljabri" },
  { label: "Résumé", href: SITE.resumePath, detail: "PDF, one page" },
];

export default function Contact() {
  return (
    <>
      <Nav current="contact" />
      <main id="main" className="wrap pt-12 md:pt-20">
        <h1 className="display text-[clamp(46px,8.4vw,76px)]">Contact</h1>
        <p className="mt-6 max-w-[40ch] text-lg leading-snug md:text-xl md:leading-[1.25]">
          {SITE.availability}. Email is the fastest way to reach me.
        </p>

        <div className="mt-14 flex flex-wrap items-center gap-x-5 gap-y-4 border-t border-rule pt-10 md:mt-20">
          <a
            href={`mailto:${SITE.email}`}
            className="display break-all text-[clamp(28px,5.4vw,60px)] decoration-1 underline-offset-[0.18em] hover:text-accent hover:underline"
          >
            {SITE.email}
          </a>
          <CopyEmail email={SITE.email} />
        </div>

        <dl className="mt-16 grid gap-8 sm:grid-cols-3 sm:gap-x-8">
          {ELSEWHERE.map((l) => (
            <div key={l.label}>
              <dt className="text-sm text-pencil">{l.detail}</dt>
              <dd className="mt-1">
                <a href={l.href} className="link wide text-lg font-semibold">
                  {l.label}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </main>
      <Footer contact={false} />
    </>
  );
}
