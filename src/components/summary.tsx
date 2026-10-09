// Building blocks shared by the home summary and the experience page.

export function SectionLabel({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="font-mono text-[11px] uppercase tracking-[0.18em] text-pencil">
      {children}
    </h2>
  );
}

export function Logo({
  src,
  monogram,
  dark = false,
  small = false,
  className = "",
}: {
  src?: string;
  monogram?: string;
  /** the logo is drawn for a dark background */
  dark?: boolean;
  /** 36px instead of 44px, for the compact rows on the home page */
  small?: boolean;
  className?: string;
}) {
  const box = `grid ${small ? "size-9" : "size-11"} shrink-0 place-items-center overflow-hidden rounded-[6px] ${className}`;
  if (src) {
    return (
      <span className={`${box} border border-rule p-1 ${dark ? "bg-[#15181c]" : "bg-white"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny pre-sized PNG */}
        <img src={src} alt="" width={96} height={96} className="h-full w-full object-contain" />
      </span>
    );
  }
  return (
    <span aria-hidden className={`${box} wide border border-rule bg-ink text-[13px] font-semibold text-paper`}>
      {monogram}
    </span>
  );
}

export function Row({ logo, title, sub, right }: { logo: React.ReactNode; title: string; sub: string; right: string }) {
  return (
    <li className="flex items-center gap-4 py-3">
      {logo}
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-snug">{title}</p>
        <p className="text-[15px] leading-snug text-pencil">{sub}</p>
        {/* on narrow screens the date sits under the text instead of squeezing it */}
        <p className="num mt-0.5 font-mono text-[12px] text-pencil sm:hidden">{right}</p>
      </div>
      <p className="num hidden shrink-0 font-mono text-[12px] text-pencil sm:block">{right}</p>
    </li>
  );
}
