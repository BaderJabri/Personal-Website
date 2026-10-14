// Plotit's request flow drawn as a sheet, in the same frame and title block as the rib drawing:
// a spreadsheet, the calls the Canva app makes to the FastAPI service, and a chart of that
// spreadsheet. The endpoints and the 202/200 polling come from the app's source; the rows are
// sample data, so the chart is drawn here from them rather than being a capture of the app.

const ROWS: [string, number, number][] = [
  ["Jan", 506, 1922],
  ["Feb", 116, 7523],
  ["Mar", 584, 7698],
  ["Apr", 217, 1820],
  ["May", 379, 4201],
  ["Jun", 100, 1643],
  ["Jul", 817, 8749],
  ["Aug", 624, 7854],
  ["Sep", 861, 1754],
  ["Oct", 642, 3856],
  ["Nov", 321, 6628],
  ["Dec", 659, 8948],
];

const CALLS: { method: string; path: string; reply: string; done?: boolean; poll?: boolean }[] = [
  { method: "POST", path: "/get-upload-url", reply: "{ url }" },
  { method: "PUT", path: "presigned S3 URL", reply: "the file" },
  { method: "POST", path: "/generate-plots-request", reply: "{ call_id }" },
  { method: "GET", path: "/get-plots/{call_id}", reply: "202", poll: true },
  { method: "GET", path: "/get-plots/{call_id}", reply: "202", poll: true },
  { method: "GET", path: "/get-plots/{call_id}", reply: "200 { plots }", done: true },
];

const Y_MAX = 900;
const Y_TICKS = [900, 600, 300, 0];
const BAND = 100 / ROWS.length;

export function PlotitSheet({ className = "" }: { className?: string }) {
  const peak = ROWS.reduce((a, b) => (b[1] > a[1] ? b : a));
  const low = ROWS.reduce((a, b) => (b[1] < a[1] ? b : a));
  return (
    <figure className={`rounded-[2px] border border-rule p-2 ${className}`}>
      <figcaption className="sr-only">
        Plotit&apos;s request flow: the Canva app uploads a spreadsheet through a presigned URL, starts a chart job on
        the FastAPI service, and polls until the charts are ready.
      </figcaption>
      <div className="border border-rule">
        <div className="@container">
          <div className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-6 p-4 font-mono text-[11px] leading-[1.35] sm:p-6 @4xl:grid-cols-[auto_1.35fr_1fr] @4xl:gap-x-8 @4xl:text-[12px]">
            <div className="col-start-1 row-start-1">
              <p className="mb-3 font-sans text-[12px] text-pencil">monthly.csv</p>
              <table className="num border-collapse text-right">
                <thead>
                  <tr className="text-pencil">
                    <th className="pb-1.5 pr-3 text-left font-normal">Date</th>
                    <th className="pr-3 pb-1.5 font-normal">Clicks</th>
                    <th className="pb-1.5 font-normal">Impr.</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map(([month, clicks, impressions]) => (
                    <tr key={month} className="border-t border-(--rule-soft)">
                      <td className="py-px pr-3 text-left">{month}</td>
                      <td className="py-px pr-3">{clicks}</td>
                      <td className="py-px text-pencil">{impressions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="col-span-2 row-start-2 @4xl:col-span-1 @4xl:col-start-2 @4xl:row-start-1">
              <p className="mb-3 font-sans text-[12px] text-pencil">Canva app to FastAPI on Modal</p>
              <ol>
                {CALLS.map((c, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[3.4em_1fr_auto] items-baseline gap-x-2 border-t border-(--rule-soft) py-1"
                  >
                    <span className="text-pencil">{c.method}</span>
                    <span className="truncate">{c.path}</span>
                    <span className={c.done ? "text-accent" : "text-pencil"}>{c.reply}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-2 font-sans text-[12px] leading-snug text-pencil">
                Polls every 2 s until the job is done.
              </p>
            </div>

            <div className="col-start-2 row-start-1 flex min-w-0 flex-col @4xl:col-start-3">
              <p className="mb-3 font-sans text-[12px] text-pencil">Clicks by month</p>
              <div className="grid min-h-[180px] flex-1 grid-cols-[auto_1fr] grid-rows-[1fr_auto] gap-x-2 gap-y-1.5">
                <div className="relative w-[3ch] text-right text-pencil">
                  {Y_TICKS.map((t) => (
                    <span
                      key={t}
                      className="absolute right-0 -translate-y-1/2"
                      style={{ top: `${100 - (t / Y_MAX) * 100}%` }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <svg
                  className="h-full w-full overflow-visible"
                  role="img"
                  aria-label={`Bar chart of clicks by month, from ${low[1]} in ${low[0]} to ${peak[1]} in ${peak[0]}.`}
                >
                  {Y_TICKS.map((t) => (
                    <line
                      key={t}
                      x1="0%"
                      x2="100%"
                      y1={`${100 - (t / Y_MAX) * 100}%`}
                      y2={`${100 - (t / Y_MAX) * 100}%`}
                      stroke="var(--rule)"
                      strokeWidth={1}
                      shapeRendering="crispEdges"
                    />
                  ))}
                  {ROWS.map(([month, clicks], i) => (
                    <rect
                      key={month}
                      x={`${i * BAND + BAND * 0.2}%`}
                      width={`${BAND * 0.6}%`}
                      y={`${100 - (clicks / Y_MAX) * 100}%`}
                      height={`${(clicks / Y_MAX) * 100}%`}
                      fill="var(--accent)"
                    />
                  ))}
                </svg>
                <div />
                <div className="grid grid-cols-12 text-center text-[10px] text-pencil @md:text-[11px] @4xl:text-[12px]">
                  {ROWS.map(([month]) => (
                    <span key={month}>{month[0]}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <dl className="grid grid-cols-2 border-t border-rule text-[12px] sm:grid-cols-4">
          {[
            ["App", "Canva Apps SDK"],
            ["Service", "FastAPI on Modal"],
            ["Upload", "Presigned S3 URL"],
            ["Returns", "Plotly figure JSON"],
          ].map(([k, v], i) => (
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
    </figure>
  );
}
