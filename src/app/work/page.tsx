import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { MoreProjects } from "@/components/MoreProjects";
import { Nav } from "@/components/Nav";
import { WorkList } from "@/components/work/Work";
import { getRibSession } from "@/lib/demo";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Work",
  description: "Projects by Bader Aljabri: Claude × AutoCAD, Tile To Pattern, Whisper4Windows and Plotit AI.",
  alternates: { canonical: "/work/" },
};

export default function WorkPage() {
  return (
    <>
      <Nav current="work" />
      <main id="main">
        <header className="wrap pt-12 md:pt-20">
          <h1 className="display text-[clamp(46px,8.4vw,76px)]">Work</h1>
          <p className="mt-6 max-w-[36ch] text-lg leading-snug md:text-xl md:leading-[1.25]">
            Software I&apos;ve shipped at Patterned AI, at a hackathon, and on my own.
          </p>
        </header>
        <WorkList projects={getAllProjects()} demo={getRibSession()} />
        <MoreProjects />
      </main>
      <Footer />
    </>
  );
}
