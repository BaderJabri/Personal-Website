import { Drawing } from "@/components/demo/Drawing";
import type { SessionEvent } from "@/lib/session-script";

// The same part as the hero replay, plotted to paper: page ink instead of AutoCAD's layer
// colours, inside a sheet border with a title block.
export function RibSheet({ events, className = "" }: { events: SessionEvent[]; className?: string }) {
  const cells = [
    ["Part", "Station-3 wing rib"],
    ["Profile", "NACA 2412, 180 mm chord"],
    ["Drawn by", "Claude × AutoCAD"],
    ["File", "SAE-Rib-Station3.dwg"],
  ];
  return (
    <div className={`rounded-[2px] border border-rule p-2 ${className}`}>
      <div className="border border-rule">
        <Drawing
          events={events}
          palette="paper"
          title="Plotted drawing of the station-3 wing rib with its dimensions"
          pad={10}
          className="block h-auto w-full px-[3%] py-[5%]"
        />
        <dl className="grid grid-cols-2 border-t border-rule text-[12px] sm:grid-cols-4">
          {cells.map(([k, v], i) => (
            <div
              key={k}
              className={`px-3 py-2 ${i > 0 ? "sm:border-l" : ""} ${i % 2 === 1 ? "border-l" : ""} ${i > 1 ? "border-t sm:border-t-0" : ""} border-rule`}
            >
              <dt className="text-pencil">{k}</dt>
              <dd className="wide truncate font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
