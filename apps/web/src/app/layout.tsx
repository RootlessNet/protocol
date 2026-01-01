import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
