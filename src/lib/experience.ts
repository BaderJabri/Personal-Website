// Experience, design teams, education and recognition, from Bader's résumés (Sep 2026, and 2025 for the
// pipeline throughput and the 2022 PEO result) plus his notes: he rejoined Patterned AI in September 2026
// and Motif Studio is that term's work. The Motif Studio facts (SAM 3 segmentation, cascade refinement and
// Gemini grouping on Modal, boundary F1 from 74.5% on the release benchmark, 12-tool registry) come from his
// role-tailored Sep 2026 résumés and his notes; the current ~92% is from Bader (2026-10-14), credited to the
// cascade refinement stage. The home page and /experience both read from here.

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
  /** the one-line result shown beside the role on the home page */
  highlight: string;
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
    highlight: "Back on a return offer, owning a new feature from prototype to launch",
    note: "Back on the team after my StartUp Lab term.",
    points: [
      "Own Motif Studio end to end, a feature that splits a repeating pattern into separately editable motifs, from first prototype to launch.",
      "Built the cloud processing on Modal: a FastAPI service that runs each upload as a background job on hosted GPUs, with progress tracking, cancellation and per-job isolation so one failed job never affects the rest.",
      "Built the image pipeline in three stages: a segmentation model outlines every motif, a refinement model cleans up the edges, and the Gemini API identifies each motif and groups related ones.",
      "Raised motif edge accuracy from 74.5% to about 92% by fine tuning the segmentation model and adding a post processing step, specifically desgned for edge refinement.",
      "Built the React and TypeScript editor for the separated motifs with custo toolings.",
    ],
    tools: ["Python", "FastAPI", "PyTorch", "SAM 3", "Modal", "TypeScript", "React", "Gemini API"],
  },
  {
    org: "StartUp Lab",
    role: "Software Engineer",
    when: "Jan. to Apr. 2026",
    short: "Jan - Apr 2026",
    where: "Waterloo, ON",
    monogram: "SL",
    highlight: "Scaled weekly client processing 20×",
    points: [
      "Owned the student side of a three-sided marketplace end to end, from data model to UI, for 1,000+ users.",
      "Scaled weekly client processing 20×, from 100 to 2,000 clients, by engineering an AI-driven pipeline.",
      "Designed the internal CRM staff use to manage students, employers and projects, with role-gated access to sensitive data.",
      "Built a nine-stage application lifecycle into the student dashboard in React, with real-time status updates.",
      "Drafted the platform's HECVAT and PSIA security and privacy assessments, documenting how personal data is handled across the stack.",
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
    highlight: "Shipped Tile To Pattern, 15,000+ monthly users",
    points: [
      "Shipped Tile To Pattern, a full-stack Canva app, in three weeks. It passed 1,500 installs in its first month and grew to 15,000+ monthly active users.",
      "Cut the company's release cycle 5× by designing task-specific Claude sub-agents, skills and workflows.",
      "Built an image processing pipeline, curating over 150,000 images to enhance dataset integrity to improve AI model training",
      "Scaled the image pipeline to 30,000+ images an hour across 10 parallel workers, over 10× its previous throughput, and cut failures 95%, by targeting identified issues.",
    ],
    tools: ["Python", "TypeScript", "React", "Canva Apps SDK", "Claude Code", "MCP"],
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
    highlight: "Built and run the team's platform and website",
    points: [
      "Built and run the team's internal platform on Directus, Postgres and Redis with SSO. It manages members, purchases and sponsorships, and powers watarrow.com.",
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
    logo: "/images/logos/wat-street.png",
    logoDark: true,
    highlight: "Graph attention for a volatility contagion model",
    points: [
      "Engineered the graph-attention module in PyTorch for a GAT+LSTM model of how volatility spreads between S&P 500 stocks.",
      "Designed the Pandas pipeline that turns 1.9M+ rows of S&P 500 data into structured training inputs.",
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
  { what: "PEO High School Coding Contest", result: "2nd place", when: "2022" },
  { what: "PEO Mathletics Competition", result: "1st place", when: "2019" },
  { what: "Hack the North", result: "Participant", when: "2026" },
  { what: "AWS Cloud Practitioner Certificate", result: "In progress" },
];

export const TOOLS = [
  { group: "Languages", list: "Python, TypeScript, JavaScript, SQL, C++, C, Rust, Java" },
  { group: "Libraries and frameworks", list: "FastAPI, React, Next.js, Node.js, PyTorch, Pandas" },
  { group: "Infrastructure", list: "AWS, Postgres, Redis, Modal, Vercel, Docker" },
  { group: "Development tools", list: "Claude Code, Codex, OpenAI API, Gemini API, Supabase, Git" },
];
