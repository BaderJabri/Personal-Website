import type { Metadata } from "next";
import { ChessPuzzles } from "@/components/client/ChessPuzzles";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Chess",
  description: "Ten chess puzzles from real games, starting at mate in one and getting harder.",
  alternates: { canonical: "/chess/" },
};

export default function ChessPage() {
  return (
    <>
      <Nav current="chess" />
      <main id="main" className="wrap pt-14 md:pt-24">
        <h1 className="display text-[clamp(46px,8.4vw,76px)]">Chess</h1>
        <p className="mt-6 max-w-[52ch] text-lg leading-snug text-pencil">
          I play a lot of chess. These are ten positions from real games, starting at mate in one and getting
          harder as you go. Click a piece or drag it.
        </p>
        <div className="mt-12 md:mt-16">
          <ChessPuzzles />
        </div>
        <p className="mt-16 max-w-[70ch] text-xs leading-relaxed text-pencil">
          Puzzles from the{" "}
          <a className="link" href="https://database.lichess.org/#puzzles">
            Lichess puzzle database
          </a>
          , released under CC0. Pieces are the cburnett set. Your progress stays in this browser.
        </p>
      </main>
      <Footer />
    </>
  );
}
