import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { MoreProjects } from "@/components/MoreProjects";
import { Nav } from "@/components/Nav";
import { WorkList } from "@/components/work/Work";
import { getRibSession } from "@/lib/demo";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Projects by Bader Aljabri: Claude × AutoCAD, Tile To Pattern, Whisper4Windows and Plotit AI.",
  alternates: { canonical: "/projects/" },
};

export default function ProjectsPage() {
  return (
    <>
      <Nav current="projects" />
      <main id="main">
        <header className="wrap pt-14 md:pt-24">
          <h1 className="display text-[clamp(46px,8.4vw,76px)]">Projects</h1>
          <p className="mt-6 max-w-[40ch] text-lg leading-snug text-pencil md:text-xl md:leading-[1.3]">
            Software I&apos;ve shipped at Patterned AI, at a hackathon, and on my own. Two of them run right on
            their pages.
          </p>
        </header>
        <WorkList projects={getAllProjects()} demo={getRibSession()} />
        <MoreProjects />
      </main>
      <Footer />
    </>
  );
}
