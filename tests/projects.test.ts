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
  links: { live: { href: "https://www.canva.com/apps", label: "Open in Canva" } },
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

  test("a download is a file under /downloads/ or an external release page", () => {
    const download = (href: string) =>
      projectFrontmatterSchema.safeParse({ ...valid, links: { download: { href, label: "Download" } } }).success;
    expect(download("/downloads/part.dwg")).toBe(true);
    expect(download("https://github.com/BaderJabri/Whisper4Windows/releases/latest")).toBe(true);
    expect(download("/images/part.dwg")).toBe(false);
    expect(download("not a url")).toBe(false);
  });

  test("the media slot defaults to the cover image", () => {
    expect(projectFrontmatterSchema.parse(valid).visual).toBe("cover");
  });

  test("a cover visual needs a cover image", () => {
    expect(projectFrontmatterSchema.safeParse(without(valid, "cover")).success).toBe(false);
    expect(projectFrontmatterSchema.safeParse({ ...without(valid, "cover"), visual: "rib" }).success).toBe(true);
  });

  test("a live link names its destination", () => {
    expect(projectFrontmatterSchema.safeParse({ ...valid, links: { live: "https://x.com" } }).success).toBe(false);
    expect(projectFrontmatterSchema.safeParse({ ...valid, links: { live: { href: "https://x.com" } } }).success).toBe(
      false,
    );
  });

  test("a playground must be one the site has", () => {
    expect(projectFrontmatterSchema.safeParse({ ...valid, playground: "chart" }).success).toBe(false);
    expect(projectFrontmatterSchema.safeParse({ ...valid, playground: "pattern" }).success).toBe(true);
  });

  test("a cover may name a smaller encode, as a site path", () => {
    const withSmall = (small: string) => ({ ...valid, cover: { ...valid.cover, small } });
    expect(projectFrontmatterSchema.safeParse(withSmall("x.webp")).success).toBe(false);
    expect(projectFrontmatterSchema.safeParse(withSmall("/x-800.webp")).success).toBe(true);
  });

  test("metrics and links are optional", () => {
    expect(projectFrontmatterSchema.safeParse(without(valid, "metrics", "links")).success).toBe(true);
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
