// Experience, design teams, education and recognition, from Bader's résumé (Sep 2026) plus his note
// that he rejoined Patterned AI in September 2026. The home page and /experience both read from here.

export interface Role {
  org: string;
  /** what the organization is, when the name alone doesn't say */
  about?: string;
  role: string;
  when: string;
  short: string;
  where?: string;
  logo?: string;
  /** the logo is drawn for a dark background */
  logoDark?: boolean;
  monogram?: string;
  link?: { href: string; label: string };
  note?: string;
  points: string[];
  tools?: string[];
}

export const WORK: Role[] = [
  {
    org: "Patterned AI",
    role: "Software Engineer",
    when: "Sep. 2026 to now",
    short: "Sep 2026 - now",
    where: "London, UK",
    logo: "/images/logos/patterned-ai.png",
    note: "Back on the team after my StartUp Lab term.",
    points: [],
  },
  {
    org: "StartUp Lab",
    role: "Software Engineer",
    when: "Jan. to Apr. 2026",
    short: "Jan - Apr 2026",
    where: "Waterloo, ON",
    monogram: "SL",
    points: [
      "Built one of the platform's three user experiences, from database to interface, for a service with 1,000+ users.",
      "Designed the staff tools for managing students, employers and projects, with access based on each person's role.",
      "Built a student dashboard that tracks applications through nine stages and updates as their status changes.",
      "Prepared security and privacy assessments, documenting how the platform handles personal data.",
      "Automated client processing with AI, increasing weekly capacity from 100 to 2,000 clients.",
    ],
    tools: ["TypeScript", "React", "Next.js", "Gemini API"],
  },
  {
    org: "Patterned AI",
    role: "Software Engineer",
    when: "Jun. 2024 to Jan. 2026",
    short: "2024 - Jan 2026",
    where: "London, UK",
    logo: "/images/logos/patterned-ai.png",
    points: [
      "Built Tile To Pattern, a Canva app that grew past 15,000 monthly active users.",
      "Built Motif Studio's React editor and Python service, including cancellable jobs and AI-generated reports.",
      "Created a fixed set of tests for model releases. It caught a model that scored better overall but performed worse on specific cases.",
      "Made releases five times faster with coding agents and reusable development workflows.",
      "Added retries and saved progress to data-processing jobs, reducing failures by 95%.",
    ],
    tools: ["Python", "FastAPI", "TypeScript", "React", "Claude Code"],
  },
];

export const DESIGN_TEAMS: Role[] = [
  {
    org: "WatArrow",
    about: "UW SAE Aero Design",
    role: "Software Infrastructure Lead",
    when: "Feb. 2026 to now",
    short: "Feb 2026 - now",
    where: "Waterloo, ON",
    logo: "/images/logos/watarrow.png",
    logoDark: true,
    link: { href: "https://watarrow.com", label: "watarrow.com" },
    points: [
      "Built and maintain the team's website and internal tools for managing members, purchases and sponsorships.",
    ],
    tools: ["Directus", "DigitalOcean", "Postgres", "Redis"],
  },
  {
    org: "Wat Street",
    about: "UW Quantitative Finance",
    role: "Machine Learning Engineer",
    when: "May 2026 to now",
    short: "May 2026 - now",
    where: "Waterloo, ON",
    monogram: "WS",
    points: [
      "Built the PyTorch component that learns relationships between stocks to model how volatility spreads across the market.",
      "Prepared over 1.9 million rows of S&P 500 data for model training with Pandas.",
    ],
    tools: ["PyTorch", "NumPy", "Pandas", "Graph Neural Networks"],
  },
];

export const EDUCATION = [
  {
    school: "University of Waterloo",
    degree: "Bachelor of Computer Science",
    short: "2024–Present",
    logo: "/images/logos/waterloo.png",
  },
  {
    school: "Wilfrid Laurier University",
    degree: "Bachelor of Business Administration",
    short: "2024–Present",
    logo: "/images/logos/laurier.png",
  },
] as const;

export const EDUCATION_NOTES = [
  "President's Gold Scholarship ($20,000) for a 95%+ average.",
  "Coursework includes algorithm design, sequential programs, functional programming and data structures.",
];

export const RECOGNITION = [
  { what: "Canadian Computing Competition, Senior", result: "Top of school", when: "2024" },
  { what: "PEO High School Coding Contest", result: "1st place", when: "2023" },
  { what: "PEO Mathletics Competition", result: "1st place", when: "2019" },
  { what: "Hack the North", result: "Participant", when: "2026" },
  { what: "AWS Cloud Practitioner Certificate", result: "In progress", when: "" },
];

export const TOOLS = [
  { group: "Languages", list: "Python, TypeScript, JavaScript, SQL, C++, C, Rust, Java" },
  { group: "Libraries and frameworks", list: "FastAPI, React, Next.js, Node.js, PyTorch, Pandas" },
  { group: "Infrastructure", list: "AWS, Postgres, Redis, Modal, Vercel, Docker" },
  { group: "Development tools", list: "Claude Code, Codex, OpenAI API, Gemini API, Supabase, Git" },
];
