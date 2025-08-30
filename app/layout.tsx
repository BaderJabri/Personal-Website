import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Portfolio | UWaterloo CS & Business Student",
  description: "Personal portfolio of a University of Waterloo Computer Science and Business Administration student",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function updateBackground() {
                const scrollY = window.scrollY;
                const scrollProgress = scrollY / (document.documentElement.scrollHeight - window.innerHeight);
                
                // Slower, more subtle movement (reduced from 100 to 20)
                const x1 = scrollProgress * 20;
                const y1 = scrollProgress * 15;
                const x2 = 100 - (scrollProgress * 25);
                const y2 = 100 - (scrollProgress * 20);
                const x3 = 50 + (scrollProgress * 10);
                const y3 = scrollProgress * 30;
                
                document.body.style.backgroundPosition = 
                  x1 + '% ' + y1 + '%, ' + 
                  x2 + '% ' + y2 + '%, ' + 
                  x3 + '% ' + y3 + '%';
              }
              
              window.addEventListener('scroll', updateBackground, { passive: true });
            `,
          }}
        />
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
