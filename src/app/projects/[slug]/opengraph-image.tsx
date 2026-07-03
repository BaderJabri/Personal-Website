import { ImageResponse } from "next/og";
import { getAllProjects, getProject } from "@/lib/projects";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { frontmatter } = getProject(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#fcfcfa",
          color: "#17171a",
        }}
      >
        <div
          style={{
            width: "360px",
            height: "2px",
            background: "#002fa7",
            marginBottom: "40px",
          }}
        />
        <div style={{ fontSize: 72, fontWeight: 200 }}>{frontmatter.title}</div>
        <div style={{ display: "flex", fontSize: 28, opacity: 0.6, marginTop: 16 }}>
          {`${frontmatter.summary} · ${frontmatter.year}`}
        </div>
      </div>
    ),
    size,
  );
}
