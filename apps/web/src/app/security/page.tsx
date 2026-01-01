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
    <div className="min-h-screen bg-slate-950">
      <header className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
          <span className="font-bold gradient-text">RootlessNet</span>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 gradient-text">
          Security Architecture
        </h1>

        <p className="text-xl text-gray-400 mb-12">
          RootlessNet is designed with a "security-first" philosophy. Every
          architectural decision is evaluated against its impact on user privacy
          and censorship resistance.
        </p>

        <div className="grid gap-8 mb-16">
          {sections.map((section) => (
            <div
              key={section.title}
              className="glass p-8 rounded-2xl glow-hover"
            >
              <section.icon className="w-8 h-8 text-primary-400 mb-4" />
              <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
              <p className="text-gray-400 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Cryptographic Choices</h2>
          <div className="glass overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-4 font-semibold">Purpose</th>
                  <th className="p-4 font-semibold">Algorithm</th>
                  <th className="p-4 font-semibold">Strength</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr>
                  <td className="p-4 text-gray-400">Signatures</td>
                  <td className="p-4 font-mono text-accent-400">Ed25519</td>
                  <td className="p-4">128-bit</td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-400">Key Exchange</td>
                  <td className="p-4 font-mono text-accent-400">X25519</td>
                  <td className="p-4">128-bit</td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-400">Encryption</td>
                  <td className="p-4 font-mono text-accent-400">
                    XChaCha20-Poly1305
                  </td>
                  <td className="p-4">256-bit key</td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-400">Hashing</td>
                  <td className="p-4 font-mono text-accent-400">BLAKE3</td>
                  <td className="p-4">256-bit</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl mb-16">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-6 h-6" />
            Vulnerability Disclosure
          </h2>
          <p className="text-gray-400 mb-6">
            If you find a security vulnerability, please report it to us
            immediately. We practice responsible disclosure and will work with
            you to fix and verify the issue.
          </p>
          <div className="flex gap-4">
            <a
              href="mailto:security@rootlessnet.org"
              className="btn-primary bg-red-600 hover:bg-red-500"
            >
              Report Issue
            </a>
            <Link href="/docs/security-policy" className="btn-secondary">
              Security Policy
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
