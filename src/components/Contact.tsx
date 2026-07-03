import { SITE } from "@/lib/site";
import { CopyEmail } from "@/components/client/CopyEmail";

export function Contact() {
  return (
    <section id="contact" className="relative px-11">
      <div className="ml-[66px] pb-8">
        <p className="mono10">
          05 — contact · <span className="text-[oklch(.45_.13_155)] dark:text-[oklch(.74_.14_155)]">available for W27 co-op</span>
        </p>
        <p className="mt-9 text-2xl font-light">
          <a href={`mailto:${SITE.email}`} data-underline-target>{SITE.email}</a>
          <CopyEmail email={SITE.email} />
        </p>
        <p className="mono10 mt-6">
          <a href={SITE.github}>github / baderjabri</a> · <a href={SITE.linkedin}>linkedin / baderaljabri</a> · <a href={SITE.resumePath}>resume ↗</a> · the line ends here.
        </p>
      </div>
    </section>
  );
}
