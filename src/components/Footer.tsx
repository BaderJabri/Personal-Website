import { ThemeToggle } from "@/components/client/ThemeToggle";

export function Footer() {
  return (
    <footer className="px-11" style={{ borderTop: "1px solid var(--hairline)" }}>
      <div className="ml-[66px] flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-[14px] pb-4">
        <span className="mono10">© 2026 bader aljabri — drawn in one line</span>
        <div className="flex flex-wrap items-center gap-4">
          <a href="/colophon" className="mono10">
            colophon ↗
          </a>
          <a href="https://github.com/BaderJabri/Personal-Website" className="mono10">
            source ↗
          </a>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
