import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <Nav />
      <main>
        <Hero />
        <section id="drafting" className="px-11 pb-12">
          <p className="mono10 ml-[66px]">01 — currently drafting</p>
        </section>
        <section id="work" className="px-11 pb-12">
          <p className="mono10 ml-[66px]">02 — selected work</p>
        </section>
        <About />
        <section id="play" className="px-11 pb-12">
          <p className="mono10 ml-[66px]">04 — play</p>
        </section>
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
