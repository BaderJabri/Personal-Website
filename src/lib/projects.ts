import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

export const projectFrontmatterSchema = z.object({
  title: z.string().min(1),
  /** The heading on the home page, e.g. "Tiles into patterns". */
  transform: z.string().min(1),
  summary: z.string().min(1),
  year: z.number().int(),
  role: z.string().min(1),
  status: z.enum(["shipped", "in-progress"]),
  stack: z.array(z.string().min(1)).min(1),
  metrics: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) })).default([]),
  /** Optional: a project without one supplies its own visual (Claude × AutoCAD draws its part). */
  cover: z
    .object({
      src: z.string().startsWith("/"),
      alt: z.string().min(1),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    })
    .optional(),
  links: z
    .object({
      github: z.url().optional(),
      live: z.url().optional(),
      download: z
        .object({
          href: z.string().startsWith("/downloads/"),
          label: z.string().min(1),
        })
        .optional(),
    })
    .default({}),
  order: z.number().int(),
  draft: z.boolean().default(false),
});

export type ProjectFrontmatter = z.output<typeof projectFrontmatterSchema>;

export interface Project {
  slug: string;
  frontmatter: ProjectFrontmatter;
  body: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "projects");

export function getAllProjects(dir: string = CONTENT_DIR): Project[] {
  const slugs = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  return slugs
    .map((slug) => {
      const file = path.join(dir, slug, "index.mdx");
      const { data, content } = matter(fs.readFileSync(file, "utf8"));
      const parsed = projectFrontmatterSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(
          `Invalid frontmatter in ${file}:\n${parsed.error.issues
            .map((i) => `  ${i.path.join(".")}: ${i.message}`)
            .join("\n")}`,
        );
      }
      return { slug, frontmatter: parsed.data, body: content };
    })
    .filter((p) => !p.frontmatter.draft)
    .sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

export function getProject(slug: string): Project {
  const project = getAllProjects().find((p) => p.slug === slug);
  if (!project) throw new Error(`No project with slug "${slug}"`);
  return project;
}
