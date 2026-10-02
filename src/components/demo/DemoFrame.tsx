import { DemoPlayer } from "@/components/client/DemoPlayer";
import type { SessionEvent } from "@/lib/session-script";
import { Drawing } from "./Drawing";

// The two windows of a Claude Code + AutoCAD session, rendered at their finished state.
// Both are dark in either site theme: they are pictures of real apps, and AutoCAD's model
// space is #212830 by default.

function TerminalLine({ ev, i }: { ev: SessionEvent; i: number }) {
  switch (ev.kind) {
    case "prompt":
      return (
        <li data-ev={i} className="flex gap-2 text-[#e6edf3]">
          <span aria-hidden className="text-[#7d8590]">
            &gt;
          </span>
          {/* The invisible copy holds the prompt's full height while it types, so nothing below moves. */}
          <span className="relative">
            <span aria-hidden className="invisible">
              {ev.text}
            </span>
            <span data-prompt className="absolute inset-0">
              {ev.text}
            </span>
          </span>
        </li>
      );
    case "thinking":
      return (
        <li data-ev={i} className="flex gap-2 italic text-[#8b949e]">
          <span aria-hidden className="term-pulse not-italic text-[#e3b341]">
            ✻
          </span>
          <span>{ev.text}…</span>
        </li>
      );
    case "tool_call":
      return (
        <li data-ev={i} className="flex gap-2">
          <span aria-hidden className="text-[#3fb950]">
            ⏺
          </span>
          <span>
            <span className="font-bold text-[#e6edf3]">{ev.tool}</span>
            <span className="text-[#8b949e]">{ev.args}</span>
          </span>
        </li>
      );
    case "tool_result":
      return (
        <li data-ev={i} className="flex gap-2 pl-[1.1em] text-[#8b949e]">
          <span aria-hidden>⎿</span>
          <span>{ev.text}</span>
        </li>
      );
    case "done":
      return (
        <li data-ev={i} data-done className="flex gap-2 text-[#e6edf3]">
          <span aria-hidden>⏺</span>
          <span>{ev.text}</span>
        </li>
      );
    default:
      return null;
  }
}

export function DemoFrame({ events }: { events: SessionEvent[] }) {
  const echoes = events.flatMap((e) => (e.kind === "command_echo" ? [e.text] : []));

  return (
    <DemoPlayer events={events}>
      <figure
        aria-label="Replay of Claude Code drafting a wing rib in AutoCAD"
        className="grid overflow-hidden rounded-[2px] border border-rule bg-[#15181d] lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]"
      >
        {/* Claude Code. Side by side, the AutoCAD pane sets the height ([contain:size] keeps the
            transcript from growing the row); the prompt stays put while older lines scroll off the top. */}
        <div className="order-2 flex min-h-0 flex-col border-t border-white/10 lg:order-1 lg:border-r lg:border-t-0 lg:[contain:size]">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-2 font-mono text-[11px] text-[#7d8590]">
            <span>claude ~/claude-autocad</span>
            <span className="hidden sm:inline">AutoCAD plugin on localhost</span>
          </div>
          <ol className="px-4 pt-4 font-mono text-[11.5px] leading-[1.55]">
            {events.map((ev, i) => (ev.kind === "prompt" ? <TerminalLine key={i} ev={ev} i={i} /> : null))}
          </ol>
          <ol className="terminal-log flex h-[230px] min-h-0 flex-col justify-end gap-2 overflow-hidden px-4 pb-4 pt-3 font-mono text-[11.5px] leading-[1.55] lg:h-auto lg:flex-1">
            {events.map((ev, i) => (ev.kind === "prompt" ? null : <TerminalLine key={i} ev={ev} i={i} />))}
          </ol>
          <div className="px-4 pb-4">
            <div className="rounded-[4px] border border-white/20 px-3 py-2 font-mono text-[11.5px] text-[#e6edf3]">
              <span className="text-[#7d8590]">&gt; </span>
              <span className="term-cursor" aria-hidden />
            </div>
          </div>
        </div>

        {/* AutoCAD */}
        <div className="order-1 flex min-w-0 flex-col lg:order-2">
          <div className="flex items-end gap-1 bg-[#2b333d] px-2 pt-1.5 text-[11.5px] text-[#aeb7c2]">
            <span className="px-3 py-1 text-[#7d8894]">Start</span>
            <span className="rounded-t-[2px] bg-[#212830] px-3 py-1 text-[#e6edf3]">SAE-Rib-Station3.dwg</span>
          </div>
          <div className="model-space relative aspect-[16/10] lg:aspect-auto lg:h-[470px]">
            <Drawing
              events={events}
              palette="model"
              title="Station-3 wing rib: NACA 2412 outline, two spar slots, five lightening holes, centerlines and dimensions"
              pad={8}
              className="absolute inset-0 h-full w-full p-[4%]"
            />
            <svg aria-hidden className="absolute bottom-2 left-2 h-6 w-6 opacity-70 sm:bottom-3 sm:left-3 sm:h-9 sm:w-9" viewBox="0 0 36 36">
              <path d="M5 31H30M5 31V6" stroke="#cfd6dd" strokeWidth="1.2" fill="none" />
              <path d="M30 28.5l5 2.5-5 2.5z M2.5 6l2.5-5 2.5 5z" fill="#cfd6dd" />
              <text x="27" y="26" fontSize="7" fill="#cfd6dd" fontFamily="sans-serif">X</text>
              <text x="8" y="10" fontSize="7" fill="#cfd6dd" fontFamily="sans-serif">Y</text>
            </svg>
          </div>
          <div className="border-t border-black/40 bg-[#2b333d] px-3 py-1.5 font-mono text-[11px] leading-[1.6]">
            <div data-cmd="previous" className="truncate text-[#7d8894]">
              {echoes.at(-2)}
            </div>
            <div data-cmd="current" className="truncate text-[#e6edf3]">
              {echoes.at(-1)}
            </div>
          </div>
        </div>
      </figure>
    </DemoPlayer>
  );
}
