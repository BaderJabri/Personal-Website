import Link from "next/link";
import { ChessPuzzle } from "@/components/client/ChessPuzzle";

// Every line here comes from the résumé (public/Bader-Aljabri-2025.pdf) or the old site's about copy.

const EXPERIENCE = [
  "Shipped Tile To Pattern in three weeks: 1,500+ installs and 600+ active users in its first month.",
  "Built a scraping and filtering pipeline that curated 150,000+ training images.",
  "Scaled image processing to 30,000+ images an hour across 10 workers, with 95% fewer failures.",
  "Cut release time by 5× with agentic automation built on MCP servers.",
];

const RECOGNITION = [
  ["PEO High School Coding Contest", "1st place, 2023 (2nd in 2022)"],
  ["Canadian Computing Competition, Senior", "Top of school, 2024"],
  ["PEO Mathletics", "1st place, 2019"],
];

const SKILLS = [
  ["Languages", "TypeScript, JavaScript, Python, Rust, C, C++, Java, Racket"],
  ["Building with", "React, Node.js, Next.js, FastAPI, Tauri, Docker, Git, Linux, CUDA"],
  ["AI tooling", "Model Context Protocol, LLM APIs, agentic automation"],
];

function Portrait({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export, pre-sized WebP
    <img
      src="/images/work/portrait.webp"
      width={480}
      height={480}
      alt="Bader Aljabri"
      decoding="async"
      className={`aspect-square rounded-[2px] border border-rule object-cover grayscale ${className}`}
    />
  );
}

/** Home: a short introduction that leads to /about. */
export function AboutTeaser() {
  return (
    <section aria-labelledby="intro-title" className="wrap pt-28 md:pt-40">
      <div data-reveal className="grid gap-8 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-x-10">
        <Portrait className="w-28 sm:w-40" />
        <div className="max-w-[60ch]">
          <h2 id="intro-title" className="display text-[clamp(30px,3.6vw,40px)]">
            Hi, I&apos;m Bader
          </h2>
          <p className="mt-5 text-lg leading-[1.5]">
            I study computer science at the University of Waterloo and business at Wilfrid Laurier University, and
            I&apos;ve been a software engineer intern at Patterned AI since 2024.
          </p>
          <Link href="/about/" className="link mt-6 inline-block text-sm">
            More about me
          </Link>
        </div>
      </div>
    </section>
  );
}

/** /about */
export function AboutPage() {
  return (
    <>
      <header className="wrap grid gap-10 pt-12 md:grid-cols-12 md:gap-x-8 md:pt-20">
        <div className="md:col-span-8">
          <h1 className="display text-[clamp(46px,8.4vw,76px)]">About</h1>
          <div className="mt-8 max-w-[60ch] space-y-4 text-lg leading-[1.5]">
            <p>
              I&apos;m in the Waterloo and Laurier double degree: computer science at the University of Waterloo and
              business at Wilfrid Laurier University, graduating in 2029.
            </p>
            <p>
              Since 2024 I&apos;ve been a software engineer intern at Patterned AI, where I ship Canva apps and the
              data pipelines behind them.
            </p>
            <p>Away from a keyboard I play soccer, volleyball and table tennis, and a lot of chess.</p>
          </div>
        </div>
        <Portrait className="w-40 md:col-span-3 md:col-start-10 md:w-full" />
      </header>

      <section aria-labelledby="experience-title" className="wrap pt-24 md:pt-32">
        <div data-reveal className="grid gap-8 border-t border-rule pt-10 md:grid-cols-12 md:gap-x-8">
          <div className="md:col-span-4">
            <h2 id="experience-title" className="wide text-lg font-semibold">
              Patterned AI
            </h2>
            <p className="text-sm text-pencil">Software engineer intern, 2024 to now</p>
          </div>
          <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2 md:col-span-8">
            {EXPERIENCE.map((line) => (
              <li key={line} className="border-l border-rule pl-4 leading-snug">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="education-title" className="wrap pt-16 md:pt-24">
        <div data-reveal className="grid gap-12 border-t border-rule pt-10 md:grid-cols-12 md:gap-x-8">
          <div className="md:col-span-4">
            <h2 id="education-title" className="wide text-lg font-semibold">
              Education
            </h2>
            <p className="mt-2 leading-snug">BCS and BBA, co-op, University of Waterloo and Wilfrid Laurier University</p>
            <p className="num mt-1 text-sm text-pencil">2024 to 2029. President&apos;s Gold Scholarship, 95%+ average.</p>
          </div>
          <div className="md:col-span-4">
            <h2 className="wide text-lg font-semibold">Recognition</h2>
            <dl className="mt-2 space-y-3">
              {RECOGNITION.map(([what, result]) => (
                <div key={what}>
                  <dt className="leading-snug">{what}</dt>
                  <dd className="num text-sm text-pencil">{result}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="md:col-span-4">
            <h2 className="wide text-lg font-semibold">Volunteering</h2>
            <p className="mt-2 leading-snug">MAC Alhuda Schools</p>
            <p className="num mt-1 text-sm text-pencil">
              2019 to 2023. Four years at a weekend school, helping run the day for 400+ students and staff.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="chess-title" className="wrap pt-24 md:pt-32">
        <div data-reveal className="border-t border-rule pt-10">
          <h2 id="chess-title" className="display text-[clamp(30px,3.6vw,40px)]">
            Your move
          </h2>
          <p className="mt-4 max-w-[52ch] text-pencil">
            I play a lot of chess, so here are three quick puzzles while you&apos;re here.
          </p>
          <div className="mt-10">
            <ChessPuzzle />
          </div>
        </div>
      </section>

      <section aria-labelledby="skills-title" className="wrap pt-16 md:pt-24">
        <div className="border-t border-rule pt-10">
          <h2 id="skills-title" className="wide text-lg font-semibold">
            Tools I use
          </h2>
          <dl className="mt-6 grid gap-6 md:grid-cols-12 md:gap-x-8">
            {SKILLS.map(([group, list]) => (
              <div key={group} className="md:col-span-4">
                <dt className="text-sm text-pencil">{group}</dt>
                <dd className="mt-1 leading-snug">{list}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
