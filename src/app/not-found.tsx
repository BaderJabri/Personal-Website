import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main" className="wrap min-h-[60dvh] pb-24 pt-16 md:pt-24">
        <p className="num text-sm text-pencil">404</p>
        <h1 className="display mt-4 text-[clamp(40px,6.4vw,76px)]">Nothing at this address</h1>
        <p className="mt-6 max-w-[46ch] text-lg leading-snug text-pencil">
          The page may have moved when the site was rebuilt. Everything that exists is linked from the home page.
        </p>
        <Link href="/" className="btn mt-10">
          Go to the home page
        </Link>
      </main>
      <Footer />
    </>
  );
}
