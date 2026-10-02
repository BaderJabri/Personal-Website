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
      "Owned one of the platform's three user roles end to end, from data model to UI, serving 1,000+ users.",
      "Designed the internal CRM that StartUp Lab staff use to manage students, employers and projects.",
      "Built a 9-state application life cycle into the student dashboard in React, with real-time updates.",
      "Secured sensitive data with a role-gated CRM, letting admins run a three-sided marketplace in real time.",
      "Drafted the platform's HECVAT and PSIA assessments, collecting evidence on data handling across the stack.",
      "Scaled weekly processing capacity from 100 to 2,000 clients with an AI-driven processing pipeline.",
    ],
    tools: ["TypeScript", "React", "Next.js", "IAM", "PSIA", "HECVAT", "SOC 2", "Gemini API"],
  },
  {
    org: "Patterned AI",
    role: "Software Engineer",
    when: "Jun. 2024 to Jan. 2026",
    short: "2024 - Jan 2026",
    where: "London, UK",
    logo: "/images/logos/patterned-ai.png",
    points: [
      "Built and shipped a full-stack Canva app that grew past 15,000 monthly active users.",
      "Owned Motif Studio, a client-requested feature, end to end: a FastAPI job service with cancellation and per-job isolation, a Gemini reporting step, and a React and TypeScript editor.",
      "Built a frozen eval benchmark that gates every model release. It blocked a higher-scoring candidate that had regressed.",
      "Cut the release cycle by 5× with task-specific Claude sub-agents, skills and workflows.",
      "Designed fail-safes (checkpointing, retries, resumable runs) that cut pipeline failures by 95%.",
    ],
    tools: ["Python", "FastAPI", "TypeScript", "React", "MCP", "LLMs", "CI/CD"],
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
      "Built and run the team's internal platform and CRM. It powers the team's website and manages members, purchases and sponsorships.",
    ],
    tools: ["Directus", "DigitalOcean", "Postgres", "Redis", "SSO"],
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
      "Engineered the graph-attention module in PyTorch for a GAT + LSTM volatility contagion model.",
      "Designed a Pandas pipeline that turns 1.9M+ rows of S&P 500 data into structured inputs for training.",
    ],
    tools: ["PyTorch", "NumPy", "Pandas", "Graph Neural Networks"],
  },
];

export const EDUCATION = [
  {
    school: "University of Waterloo",
    degree: "Bachelor of Computer Science",
    short: "2024 - 2029",
    logo: "/images/logos/waterloo.png",
  },
  {
    school: "Wilfrid Laurier University",
    degree: "Bachelor of Business Administration",
    short: "2024 - 2029",
    logo: "/images/logos/laurier.png",
  },
] as const;

export const EDUCATION_NOTES = [
  "Waterloo and Laurier double degree, 2024 to 2029.",
  "President's Gold Scholarship ($20,000) for a 95%+ average.",
  "Coursework includes algorithm design, sequential programs, functional programming and data structures.",
];

export const RECOGNITION = [
  { what: "Canadian Computing Competition, Senior", result: "Top of school", when: "2024" },
  { what: "PEO High School Coding Contest", result: "1st place", when: "2023" },
  { what: "PEO Mathletics Competition", result: "1st place", when: "2019" },
  { what: "Hack The North", result: "Participant", when: "" },
  { what: "AWS Cloud Practitioner Certificate", result: "In progress", when: "" },
];

export const TOOLS = [
  { group: "Languages", list: "Python, TypeScript, JavaScript, SQL, C++, C, Rust, Java" },
  { group: "Libraries and frameworks", list: "FastAPI, React, Next.js, Node.js, PyTorch, Pandas" },
  { group: "Cloud and security", list: "AWS, Postgres, Redis, Modal, Vercel, SOC 2, HECVAT, IAM" },
  { group: "Tools", list: "Claude Code, Codex, MCP, OpenAI API, Gemini API, Supabase vector DBs, Docker, Git" },
];
