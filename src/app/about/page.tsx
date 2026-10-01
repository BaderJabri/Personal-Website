import type { Metadata } from "next";
import { AboutPage } from "@/components/About";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "About",
  description:
    "Bader Aljabri studies computer science at Waterloo and business at Laurier, and has been a software engineer intern at Patterned AI since 2024.",
  alternates: { canonical: "/about/" },
};

export default function About() {
  return (
    <>
      <Nav current="about" />
      <main id="main">
        <AboutPage />
      </main>
      <Footer />
    </>
  );
}
