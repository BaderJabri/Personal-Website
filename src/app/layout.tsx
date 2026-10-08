import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { DevFeedbackTool } from "@/components/client/DevFeedbackTool";
import { ContourField } from "@/components/client/ContourField";
import { Reveals } from "@/components/client/Reveals";
import { ThemeProvider } from "@/components/client/ThemeProvider";
import { SITE } from "@/lib/site";
import "./globals.css";

const sans = localFont({
  src: "./fonts/portfolio-sans-latin.woff2",
  variable: "--font-sans-var",
  weight: "400 900",
  declarations: [{ prop: "font-stretch", value: "100% 125%" }],
  // Keep the first paint stable on slow connections rather than swapping text late.
  display: "optional",
});

// B612 was drawn for Airbus cockpit displays. It sets the terminal and drawing text.
const mono = localFont({
  src: [
    { path: "./fonts/b612-mono-regular.woff2", weight: "400" },
    { path: "./fonts/b612-mono-bold.woff2", weight: "700" },
  ],
  variable: "--font-mono-var",
  preload: false,
  // "optional" never swaps after first paint, so the replay's terminal text can't reflow
  display: "optional",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.baseUrl),
  title: { default: "Bader Aljabri", template: "%s | Bader Aljabri" },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: "Bader Aljabri",
    url: SITE.baseUrl,
    title: "Bader Aljabri",
    description: SITE.description,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f4f1" },
    { media: "(prefers-color-scheme: dark)", color: "#101317" },
  ],
};

// Marks JS as available before first paint, so the demo can start from an empty drawing and
// scroll reveals can start hidden, without a flash. If React never hydrates (Reveals sets
// data-hydrated), the class comes off after 4 s and everything shows as plain HTML.
const jsFlag = `document.documentElement.classList.add("js");setTimeout(function(){if(!document.documentElement.dataset.hydrated)document.documentElement.classList.remove("js")},4000)`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[2px] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <ContourField />
        <ThemeProvider>{children}</ThemeProvider>
        <Reveals />
        <DevFeedbackTool />
      </body>
    </html>
  );
}
