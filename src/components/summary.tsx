// Building blocks shared by the home summary and the experience page.

export function SectionLabel({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="font-mono text-[11px] uppercase tracking-[0.18em] text-pencil">
      {children}
    </h2>
  );
}

export function Logo({ src, monogram, dashed = false }: { src?: string; monogram?: string; dashed?: boolean }) {
  const box = "grid size-11 shrink-0 place-items-center overflow-hidden rounded-[6px]";
  if (src) {
    return (
      <span className={`${box} border border-rule bg-white p-1`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny pre-sized PNG */}
        <img src={src} alt="" width={96} height={96} className="h-full w-full object-contain" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={`${box} ${dashed ? "border border-dashed border-pencil/60" : "border border-rule bg-ink text-paper"} wide text-[13px] font-semibold`}
    >
      {monogram}
    </span>
  );
}

export function Row({
  logo,
  title,
  sub,
  right,
  rightTone = "pencil",
}: {
  logo: React.ReactNode;
  title: string;
  sub: string;
  right: string;
  rightTone?: "pencil" | "accent";
}) {
  return (
    <li className="flex items-center gap-4 py-3">
      {logo}
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-snug">{title}</p>
        <p className="text-[15px] leading-snug text-pencil">{sub}</p>
        {/* on narrow screens the date sits under the text instead of squeezing it */}
        <p className={`num mt-0.5 font-mono text-[12px] sm:hidden ${rightTone === "accent" ? "text-accent" : "text-pencil"}`}>{right}</p>
      </div>
      <p className={`num hidden shrink-0 font-mono text-[12px] sm:block ${rightTone === "accent" ? "text-accent" : "text-pencil"}`}>{right}</p>
    </li>
  );
}
