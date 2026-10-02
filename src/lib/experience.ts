// Experience, education and recognition. Every line comes from the résumé
// (public/Bader-Aljabri-2025.pdf). The home page and /experience both read from here.

export interface Role {
  org: string;
  role: string;
  when: string;
  short: string;
  where?: string;
  logo?: string;
  monogram?: string;
  points: string[];
  tools?: string[];
}

export const WORK: Role[] = [
  {
    org: "Patterned AI",
    role: "Software Engineer Intern",
    when: "2024 to now",
    short: "2024 - now",
    where: "Remote",
    logo: "/images/logos/patterned-ai.png",
    points: [
      "Launched Tile To Pattern, a full-stack Node.js and React Canva app that turns a tileable image into an editable pattern: 1,500+ installs and 600+ active users in its first month.",
      "Built it in three weeks, where the previous Canva app took months, by leaning on agentic automation through MCP servers. Release cycles got about five times faster.",
      "Curated 150,000+ training images through a sitemap-driven scraping and filtering pipeline in JavaScript and Python.",
      "Wrote a modular image-processing backend that uses edge-adjacency checks to throw out tiles that don't repeat seamlessly.",
      "Took the processing scripts to 30,000+ images an hour across 10 parallel workers, with fail-safes: over 10× the throughput and 95% fewer failures.",
    ],
    tools: ["React", "TypeScript", "JavaScript", "Node.js", "Python", "MCP", "LLMs", "CI/CD"],
  },
];

export const VOLUNTEERING: Role[] = [
  {
    org: "MAC Alhuda Schools",
    role: "Volunteer",
    when: "2019 to 2023",
    short: "2019 - 2023",
    monogram: "MA",
    points: [
      "Four years at a weekend school, assisting teachers and staff.",
      "Helped run the day for 400+ students and staff, moving between classroom support, the front office and facility setup as needed.",
    ],
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
  "Co-op double degree, 2024 to 2029.",
  "President's Gold Scholarship: $4,000 a year, $20,000 in total, for a 95%+ average.",
  "Coursework includes data structures, algorithm design, software development and functional programming.",
];

export const RECOGNITION = [
  { what: "PEO High School Coding Contest", result: "1st place", when: "2023", note: "2nd place in 2022" },
  { what: "Canadian Computing Competition, Senior", result: "Top of school", when: "2024" },
  { what: "Career Development Certificate, Wilfrid Laurier University", result: "Completed", when: "2025" },
  { what: "PEO Mathletics Competition", result: "1st place", when: "2019" },
];

export const TOOLS = [
  { group: "Languages", list: "TypeScript, JavaScript, Python, Rust, C, C++, Java, Racket" },
  { group: "Building with", list: "React, Node.js, Next.js, FastAPI, Tauri, Docker, Git, Linux, CUDA" },
  { group: "AI tooling", list: "Model Context Protocol, LLM APIs, agentic automation" },
];
