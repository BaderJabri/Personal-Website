import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getAllProjects, projectFrontmatterSchema } from "../src/lib/projects";

const without = (o: Record<string, unknown>, ...keys: string[]) =>
  Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k)));

const valid = {
  title: "Tile To Pattern",
  transform: "Tiles into patterns",
  summary: "A Canva app that turns one tile into an editable pattern.",
  year: 2024,
  role: "Software engineer intern, Patterned AI",
  status: "shipped",
  stack: ["React", "Node.js"],
  metrics: [{ value: "1,500+", label: "installs in the first month" }],
  cover: { src: "/work/tile-to-pattern.webp", alt: "The app next to a finished pattern", width: 1600, height: 1200 },
  links: { live: "https://www.canva.com/apps" },
  order: 2,
};

describe("projectFrontmatterSchema", () => {
  test("accepts a complete entry and defaults draft to false", () => {
    const fm = projectFrontmatterSchema.parse(valid);
    expect(fm.draft).toBe(false);
    expect(fm.metrics).toHaveLength(1);
  });

  test("requires the transformation heading", () => {
    expect(projectFrontmatterSchema.safeParse(without(valid, "transform")).success).toBe(false);
  });

  test("cover images must declare their size so the page never shifts", () => {
    const bad = { ...valid, cover: { src: "/x.webp", alt: "x" } };
    expect(projectFrontmatterSchema.safeParse(bad).success).toBe(false);
  });

  test("status is shipped or in-progress", () => {
    expect(projectFrontmatterSchema.safeParse({ ...valid, status: "ongoing" }).success).toBe(false);
    expect(projectFrontmatterSchema.safeParse({ ...valid, status: "in-progress" }).success).toBe(true);
  });

  test("links must be real URLs", () => {
    expect(projectFrontmatterSchema.safeParse({ ...valid, links: { github: "#" } }).success).toBe(false);
  });

  test("metrics, links and cover are optional", () => {
    expect(projectFrontmatterSchema.safeParse(without(valid, "metrics", "links", "cover")).success).toBe(true);
  });
});

describe("getAllProjects", () => {
  let dir: string;
  const write = (slug: string, fm: string) => {
    fs.mkdirSync(path.join(dir, slug), { recursive: true });
    fs.writeFileSync(path.join(dir, slug, "index.mdx"), `---\n${fm}\n---\nBody of ${slug}.\n`);
  };
  // A JSON object is a valid YAML document, so fixtures can skip hand-written YAML.
  const yaml = (o: Record<string, unknown>) => JSON.stringify(o);

  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "projects-"));
    write("b", yaml({ ...valid, title: "B", order: 2 }));
    write("a", yaml({ ...valid, title: "A", order: 1 }));
    write("hidden", yaml({ ...valid, title: "H", order: 0, draft: true }));
  });
  afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

  test("sorts by order and drops drafts", () => {
    const projects = getAllProjects(dir);
    expect(projects.map((p) => p.slug)).toEqual(["a", "b"]);
    expect(projects[0].body.trim()).toBe("Body of a.");
  });

  test("names the offending file when frontmatter is invalid", () => {
    write("broken", 'title: "Broken"');
    expect(() => getAllProjects(dir)).toThrow(/broken[\\/]index\.mdx/);
    fs.rmSync(path.join(dir, "broken"), { recursive: true, force: true });
  });
});
