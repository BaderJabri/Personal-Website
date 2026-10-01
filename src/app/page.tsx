import Link from "next/link";
import { AboutTeaser } from "@/components/About";
import { ChartToy } from "@/components/client/ChartToy";
import { PatternToy } from "@/components/client/PatternToy";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { ToySection } from "@/components/work/Playground";
import { FeaturedReplay, SplitEntry } from "@/components/work/Work";
import { getRibSession } from "@/lib/demo";
import { getAllProjects } from "@/lib/projects";

export default function Home() {
  const bySlug = Object.fromEntries(getAllProjects().map((p) => [p.slug, p]));
  return (
    <>
      <Nav current="home" />
      <main id="main">
        <Hero />
        <FeaturedReplay project={bySlug["claude-autocad"]} demo={getRibSession()} />
        <ToySection id="patterns" project={bySlug["tile-to-pattern"]}>
          <PatternToy />
        </ToySection>
        <ToySection id="charts" project={bySlug["plotit"]}>
          <ChartToy />
        </ToySection>
        <section aria-label="Whisper4Windows" className="wrap pt-28 md:pt-40">
          <SplitEntry project={bySlug["whisper4windows"]} imageFirst />
        </section>
        <div className="wrap pt-20">
          <Link href="/work/" className="btn btn-quiet">
            All work and write-ups
          </Link>
        </div>
        <AboutTeaser />
      </main>
      <Footer />
    </>
  );
}
