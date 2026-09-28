import type { Metadata } from "next";
import { Saira_Semi_Condensed, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmartMagHeader } from "@/components/layout/SmartMagHeader";
import { SmartMagFooter } from "@/components/layout/SmartMagFooter";

const saira = Saira_Semi_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-saira",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.zerosuniverse.com"),
  title: {
    default: "Free Cybersecurity, Android, AI & Tech Tools (2026) | ZerosUniverse",
    template: "%s | ZerosUniverse",
  },
  description:
    "25 free 100% browser-based interactive tools for Cybersecurity, OSINT, Android diagnostics, Local LLM VRAM sizing, and Tech benchmarks by ZerosUniverse.",
  alternates: {
    canonical: "https://www.zerosuniverse.com/tools/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${saira.variable} ${inter.variable} ${mono.variable} s-light`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var s = localStorage.getItem('bunyad-scheme');
                  var d = s === 'dark' || (!s && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  document.documentElement.classList.toggle('s-dark', d);
                  document.documentElement.classList.toggle('s-light', !d);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <SmartMagHeader />
        <div className="flex-1">{children}</div>
        <SmartMagFooter />
      </body>
    </html>
  );
}
