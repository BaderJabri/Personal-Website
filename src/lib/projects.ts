import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const STATUS_HUES: Record<string, number> = {
  "in-draft": 60,
  active: 155,
  shipped: 240,
  ongoing: 300,
};

export const projectFrontmatterSchema = z
  .object({
    title: z.string().min(1),
    summary: z.string().min(1),
    year: z.number().int(),
    status: z.enum(["in-draft", "active", "shipped", "ongoing"]),
    hue: z.number().min(0).max(360).optional(),
    order: z.number().int(),
    links: z
      .object({
        github: z.string().url().optional(),
        live: z.string().url().optional(),
        writeup: z.string().url().optional(),
      })
      .optional(),
    draft: z.boolean().default(false),
  })
  .transform((fm) => ({ ...fm, hue: fm.hue ?? STATUS_HUES[fm.status] }));

export type ProjectFrontmatter = z.output<typeof projectFrontmatterSchema>;

export interface Project {
  slug: string;
  frontmatter: ProjectFrontmatter;
  body: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "projects");

export function getAllProjects(): Project[] {
  const slugs = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  return slugs
    .map((slug) => {
      const file = path.join(CONTENT_DIR, slug, "index.mdx");
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
