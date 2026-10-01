// Projects without a write-up yet. One line each, taken from the approved project list;
// they graduate to content/projects/ when there is something real to show.
const MORE = [
  { name: "WatStreet", what: "Volatility contagion modelling with graph attention networks", year: 2026, status: "In progress" },
  { name: "StartUp Lab", what: "Consulting marketplace", year: 2026, status: "In progress" },
  { name: "WatArrow", what: "Member portal for an SAE Aero team", year: 2025, status: "Shipped" },
];

export function MoreProjects() {
  return (
    <section aria-labelledby="more-title" className="wrap pt-28 md:pt-40">
      <h2 id="more-title" className="wide text-lg font-semibold tracking-[-0.01em]">
        More projects
      </h2>
      <ul className="mt-6 border-t border-rule">
        {MORE.map((p) => (
          <li key={p.name} className="grid gap-1 py-4 sm:grid-cols-12 sm:items-baseline sm:gap-x-8">
            <span className="font-semibold sm:col-span-3">{p.name}</span>
            <span className="text-pencil sm:col-span-6">{p.what}</span>
            <span className="num text-sm text-pencil sm:col-span-3 sm:text-right">
              {p.status}, {p.year}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
