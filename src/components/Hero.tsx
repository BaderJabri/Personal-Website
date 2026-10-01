import Link from "next/link";
import { InteractiveName } from "@/components/client/InteractiveName";
import { SITE } from "@/lib/site";

const phrase = "link decoration-accent/50 hover:text-accent hover:decoration-current";

export function Hero() {
  return (
    <section className="wrap pt-12 md:pt-20">
      <p data-reveal style={{ "--d": "60ms" } as React.CSSProperties} className="flex items-center gap-2.5 text-sm text-pencil">
        <span aria-hidden className="pulse-dot size-2 rounded-full bg-accent" />
        {SITE.availability}
      </p>
      <InteractiveName
        text={SITE.name}
        className="display mt-5 touch-pan-y select-none text-[clamp(52px,10.4vw,124px)] leading-[0.95]"
      />
      <p
        data-reveal
        style={{ "--d": "160ms" } as React.CSSProperties}
        className="mt-6 max-w-[30ch] text-lg leading-snug md:text-xl md:leading-[1.25]"
      >
        I build software that turns{" "}
        <a href="#replay" className={phrase}>
          prompts into parts
        </a>
        ,{" "}
        <a href="#patterns" className={phrase}>
          tiles into patterns
        </a>
        , and{" "}
        <Link href="/work/whisper4windows/" className={phrase}>
          speech into text
        </Link>
        .
      </p>
      <div data-reveal style={{ "--d": "260ms" } as React.CSSProperties} className="mt-8 flex items-center gap-3">
        <a className="btn" href={`mailto:${SITE.email}`}>
          Email me
        </a>
        <a className="btn btn-quiet" href={SITE.resumePath}>
          Résumé
        </a>
      </div>
    </section>
  );
}
