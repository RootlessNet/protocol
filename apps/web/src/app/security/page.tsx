"use client";

import Link from "next/link";
import {
  ChevronLeft,
  Shield,
  Lock,
  Eye,
  AlertTriangle,
  Key,
  Search,
} from "lucide-react";

export default function SecurityPage() {
  const sections = [
    {
      title: "Security Model",
      icon: Shield,
      content:
        "RootlessNet uses a layered security approach, ensuring that privacy and integrity are maintained even if parts of the network are compromised.",
    },
    {
      title: "Encryption",
      icon: Lock,
      content:
        "We use industry-standard XChaCha20-Poly1305 for symmetric encryption and X25519 for key exchange, providing 128-bit security.",
    },
    {
      title: "Identity Privacy",
      icon: Eye,
      content:
        "Identities are self-sovereign. No personal data is required to create a DID. All identity metadata is signed and can be optionally encrypted.",
    },
  ];

  return (
    <div className="min-h-screen bg-void font-outfit text-gray-200">
      <header className="fixed top-0 w-full z-50 bg-void/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-toxic transition-colors" />
            <span className="font-bold font-syne text-xl tracking-wide group-hover:text-toxic transition-colors">
              Rootless
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-32">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-8 font-syne text-white">
          Security <span className="text-bio">Architecture</span>
        </h1>

        <p className="text-xl text-gray-400 mb-16 font-light max-w-2xl border-l-2 border-bio pl-6 py-2">
          RootlessNet is designed with a "security-first" philosophy. Every
          architectural decision is evaluated against its impact on user privacy
          and censorship resistance.
        </p>

        <div className="grid gap-6 mb-24">
          {sections.map((section) => (
            <div
              key={section.title}
              className="glass-panel p-8 rounded-sm hover:border-bio/50 transition-colors group"
            >
              <div className="flex items-start gap-6">
                <div className="p-3 bg-bio/10 rounded-sm">
                  <section.icon className="w-8 h-8 text-bio" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-syne mb-2 text-white group-hover:text-bio transition-colors">
                    {section.title}
                  </h2>
                  <p className="text-gray-400 leading-relaxed font-light">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="mb-24">
          <h2 className="text-3xl font-bold font-syne mb-8 text-white">
            Cryptographic Choices
          </h2>
          <div className="glass-panel overflow-hidden rounded-sm border border-white/5">
            <table className="w-full text-left text-sm font-light">
              <thead className="bg-[#0A0A0A] border-b border-white/10 font-syne text-white uppercase tracking-wider text-xs">
                <tr>
                  <th className="p-5 font-bold">Purpose</th>
                  <th className="p-5 font-bold">Algorithm</th>
                  <th className="p-5 font-bold">Strength</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="p-5 text-gray-400">Signatures</td>
                  <td className="p-5 font-mono text-bio">Ed25519</td>
                  <td className="p-5 text-gray-500">128-bit</td>
                </tr>
                <tr>
                  <td className="p-5 text-gray-400">Key Exchange</td>
                  <td className="p-5 font-mono text-bio">X25519</td>
                  <td className="p-5 text-gray-500">128-bit</td>
                </tr>
                <tr>
                  <td className="p-5 text-gray-400">Encryption</td>
                  <td className="p-5 font-mono text-bio">XChaCha20-Poly1305</td>
                  <td className="p-5 text-gray-500">256-bit key</td>
                </tr>
                <tr>
                  <td className="p-5 text-gray-400">Hashing</td>
                  <td className="p-5 font-mono text-bio">BLAKE3</td>
                  <td className="p-5 text-gray-500">256-bit</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-red-950/20 border border-red-500/20 p-8 rounded-sm mb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(220,38,38,0.05)_10px,rgba(220,38,38,0.05)_20px)] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-bold font-syne mb-4 flex items-center gap-3 text-red-500">
                <AlertTriangle className="w-6 h-6" />
                Vulnerability Disclosure
              </h2>
              <p className="text-red-200/70 mb-0 font-light leading-relaxed">
                If you find a security vulnerability, please report it to us
                immediately. We practice responsible disclosure and will work
                with you to fix and verify the issue.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <a
                href="mailto:security@rootlessnet.org"
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold font-syne text-center transition-colors rounded-sm"
              >
                REPORT ISSUE
              </a>
              <Link
                href="/docs/security-policy"
                className="px-6 py-3 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300 font-bold font-syne text-center transition-colors rounded-sm"
              >
                SECURITY POLICY
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
