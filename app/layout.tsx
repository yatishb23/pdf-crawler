import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Visitors from "@/components/Visitors";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: ["400"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "bookcrawler.io",
    template: "%s | bookcrawler.io",
  },
  description:
    "Extract data from books with intelligent web crawlers. Read, parse, and analyze any book with our AI-powered tool. Transform documents into actionable knowledge.",
  applicationName: "bookcrawler.io",
  referrer: "origin-when-cross-origin",
  keywords: [
    "book crawler",
    "book reader",
    "PDF crawler",
    "PDF reader",
    "document parser",
    "web crawler",
    "PDF analysis",
    "text extraction",
  ],
  authors: [{ name: "Yatish Badgujar" }],
  colorScheme: "dark",
  creator: "bookcrawler.io",
  publisher: "bookcrawler.io",
  category: "Technology",
  manifest: "/site.webmanifest",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} antialiased bg-black text-white selection:bg-white selection:text-black font-sans`}
      >
        <Analytics/>
        <Navbar />
        <Visitors />
        {children}
      </body>
    </html>
  );
}
