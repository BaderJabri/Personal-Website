import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { DevFeedbackTool } from "@/components/client/DevFeedbackTool";
import { ThemeProvider } from "@/components/client/ThemeProvider";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans-var",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-var",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://baderjabri.ca"),
  title: "Bader Aljabri",
  description: "Software for drawing, trading, and flying.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <DevFeedbackTool />
      </body>
    </html>
  );
}
