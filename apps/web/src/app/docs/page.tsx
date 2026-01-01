"use client";

import Link from "next/link";
import {
  ChevronLeft,
  Book,
  Github,
  MessageSquare,
  Shield,
  Zap,
  Terminal,
} from "lucide-react";

export default function DocsPage() {
  const sections = [
    {
      title: "Introduction",
      items: [
        { name: "What is RootlessNet?", href: "#intro" },
        { name: "Key Principles", href: "#principles" },
        { name: "Architecture", href: "#architecture" },
      ],
    },
    {
      title: "Core Concepts",
      items: [
        { name: "Identity (DID)", href: "#identity" },
        { name: "Content Protocol", href: "#content" },
        { name: "Messaging Protocol", href: "#messaging" },
        { name: "Zones & Groups", href: "#zones" },
      ],
    },
    {
      title: "Developer Guide",
      items: [
        { name: "Getting Started", href: "#getting-started" },
        { name: "SDK Reference", href: "#sdk" },
        { name: "CLI Usage", href: "#cli" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass border-r border-white/10 p-6 md:sticky md:top-0 md:h-screen overflow-y-auto">
        <Link href="/" className="flex items-center gap-2 mb-8 group">
          <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
          <span className="font-bold gradient-text">RootlessNet</span>
        </Link>

        <nav className="space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 max-w-4xl">
        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8 gradient-text">
            Documentation
          </h1>

          <section id="intro" className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary-400" />
              What is RootlessNet?
            </h2>
            <p className="text-gray-400 leading-relaxed">
              RootlessNet is a decentralized communication protocol designed
              from the ground up to be independent of any central authority. It
              provides the building blocks for creating social networks,
              messaging apps, and community platforms that are structurally
              immune to global censorship and silent erasure.
            </p>
          </section>

          <section id="principles" className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Principles</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="glass p-4 rounded-xl">
                <h3 className="font-bold text-primary-400 mb-2">
                  Self-Sovereign
                </h3>
                <p className="text-sm text-gray-500">
                  Users own their identities via local cryptographic keys. No
                  "Sign in with X".
                </p>
              </div>
              <div className="glass p-4 rounded-xl">
                <h3 className="font-bold text-accent-400 mb-2">
                  Censorship-Resistant
                </h3>
                <p className="text-sm text-gray-500">
                  Content-addressing and P2P dispersal make it impossible to
                  globally delete speech.
                </p>
              </div>
            </div>
          </section>

          <section id="getting-started" className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Terminal className="w-6 h-6 text-green-400" />
              Getting Started
            </h2>
            <p className="text-gray-400 mb-4">
              Install the SDK to start building applications on RootlessNet.
            </p>
            <div className="code-block py-3">
              <code className="text-green-400">bun add @rootlessnet/sdk</code>
            </div>
          </section>

          <section id="identity" className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-400" />
              Identity (DID)
            </h2>
            <p className="text-gray-400">
              RootlessNet uses Decentralized Identifiers (DIDs) based on Ed25519
              public keys. A typical DID looks like:{" "}
              <code className="text-accent-400">did:rootless:key:z6Mkp...</code>
              .
            </p>
          </section>

          {/* Add more sections as needed */}

          <div className="mt-24 pt-12 border-t border-white/10 text-center">
            <p className="text-gray-500 mb-4">Need more help?</p>
            <div className="flex justify-center gap-4">
              <Link
                href="https://github.com/RootlessNet/protocol"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Github className="w-4 h-4" /> GitHub
              </Link>
              <Link
                href="https://discord.gg/rootlessnet"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> Discord
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
