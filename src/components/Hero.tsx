import { HalftoneCanvas } from "@/components/client/HalftoneCanvas";

export function Hero() {
  return (
    <section id="index" className="relative overflow-hidden px-11 pt-[26px]">
      <div className="hero-wash pointer-events-none absolute -top-[60px] -right-10 h-[300px] w-[420px]" />
      <div className="relative mt-[60px] ml-[66px] pb-14">
        <div className="absolute -top-[26px] -left-[10px] h-[120px] w-[300px] opacity-50">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--line) 1.1px, transparent 1.4px)",
              backgroundSize: "7px 7px",
              WebkitMaskImage: "linear-gradient(115deg, #000 20%, transparent 75%)",
              maskImage: "linear-gradient(115deg, #000 20%, transparent 75%)",
            }}
          />
          <HalftoneCanvas className="absolute inset-0" />
        </div>
        <h1 className="relative text-[54px] leading-[1.05] font-extralight tracking-[-0.02em]">
          Bader Aljabri
        </h1>
        <p className="relative mt-3 text-sm font-light opacity-65">
          Software for drawing, trading, and flying.
        </p>
        <div className="relative mt-4 flex flex-wrap gap-2">
          <span className="chip" style={{ "--h": 60 } as React.CSSProperties}>
            #drafting
          </span>
          <span className="chip" style={{ "--h": 155 } as React.CSSProperties}>
            #markets
          </span>
          <span className="chip" style={{ "--h": 240 } as React.CSSProperties}>
            #aero
          </span>
          <span className="chip" style={{ "--h": 300 } as React.CSSProperties}>
            #patterns
          </span>
        </div>
        <p className="mono10 relative mt-6">
          scroll — the line knows the way ↓
        </p>
      </div>
    </section>
  );
}
