import { ThemeToggle } from "@/components/client/ThemeToggle";

export function Nav() {
  return (
    <nav className="flex items-center justify-between px-11 py-6">
      <div className="flex gap-6">
        <a href="#index" className="mono10">
          index
        </a>
        <a href="#work" className="mono10">
          work
        </a>
        <a href="#play" className="mono10">
          play
        </a>
        <a href="#contact" className="mono10">
          contact
        </a>
      </div>
      <ThemeToggle />
    </nav>
  );
}
