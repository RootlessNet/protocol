import type { Metadata } from "next";
import { Syne, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RootlessNet - Decentralized Communication Protocol",
  description:
    "A rootless, ownerless substrate for human expression. Censorship-resistant, end-to-end encrypted, and truly decentralized.",
  keywords: [
    "decentralized",
    "protocol",
    "encryption",
    "privacy",
    "p2p",
    "censorship-resistant",
  ],
  authors: [{ name: "RootlessNet Community" }],
  openGraph: {
    title: "RootlessNet",
    description: "Speech without roots. Power without owners.",
    url: "https://rootlessnet.org",
    siteName: "RootlessNet",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RootlessNet",
    description: "Speech without roots. Power without owners.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${syne.variable} ${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#050505] text-gray-200 selection:bg-[#D4FF00] selection:text-black`}
      >
        {children}
      </body>
    </html>
  );
}
