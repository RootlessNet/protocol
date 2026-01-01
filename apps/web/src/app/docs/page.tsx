"use client";

import Link from "next/link";
import {
  ChevronLeft,
  Github,
  MessageSquare,
  Shield,
  Zap,
  Terminal,
} from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-void flex flex-col md:flex-row font-outfit text-gray-300 selection:bg-toxic selection:text-black">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-white/5 bg-[#080808] p-6 md:sticky md:top-0 md:h-screen overflow-y-auto">
        <Link href="/" className="flex items-center gap-2 mb-10 group">
          <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-toxic transition-colors" />
          <span className="font-bold font-syne text-xl tracking-wide text-gray-200 group-hover:text-toxic transition-colors">
            Rootless
          </span>
        </Link>

        <nav className="space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-toxic/50 mb-4 font-mono">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-400 hover:text-toxic transition-colors block border-l border-transparent hover:border-toxic pl-3 -ml-3"
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
      <main className="flex-1 p-8 md:p-16 max-w-5xl">
        <div className="prose prose-invert prose-headings:font-syne prose-headings:font-bold prose-h1:text-5xl prose-h2:text-3xl prose-p:text-gray-400 prose-code:text-toxic prose-code:bg-toxic/5 prose-code:px-1 prose-code:rounded-sm max-w-none">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-syne font-extrabold mb-12 text-white"
          >
            Documentation
          </motion.h1>

          <section id="intro" className="mb-16">
            <h2 className="flex items-center gap-3 text-white">
              <Zap className="w-6 h-6 text-toxic" />
              What is RootlessNet?
            </h2>
            <p className="text-xl leading-relaxed font-light">
              RootlessNet is a decentralized communication protocol designed
              from the ground up to be independent of any central authority. It
              provides the building blocks for creating social networks,
              messaging apps, and community platforms that are structurally
              immune to global censorship and silent erasure.
            </p>
          </section>

          <section id="principles" className="mb-16">
            <h2 className="text-white">Key Principles</h2>
            <div className="grid sm:grid-cols-2 gap-6 not-prose">
              <div className="glass-panel p-6 rounded-sm border-l-2 border-toxic">
                <h3 className="font-syne font-bold text-toxic text-lg mb-2">
                  Self-Sovereign
                </h3>
                <p className="text-sm text-gray-400">
                  Users own their identities via local cryptographic keys. No
                  "Sign in with X".
                </p>
              </div>
              <div className="glass-panel p-6 rounded-sm border-l-2 border-bio">
                <h3 className="font-syne font-bold text-bio text-lg mb-2">
                  Censorship-Resistant
                </h3>
                <p className="text-sm text-gray-400">
                  Content-addressing and P2P dispersal make it impossible to
                  globally delete speech.
                </p>
              </div>
            </div>
          </section>

          <section id="getting-started" className="mb-16">
            <h2 className="flex items-center gap-3 text-white">
              <Terminal className="w-6 h-6 text-toxic" />
              Getting Started
            </h2>
            <p>
              Install the SDK to start building applications on RootlessNet.
            </p>
            <div className="bg-[#0A0A0A] border border-white/5 rounded-sm p-4 font-mono text-sm not-prose">
              <code className="text-toxic">bun add @rootlessnet/sdk</code>
            </div>
          </section>

          <section id="identity" className="mb-16">
            <h2 className="flex items-center gap-3 text-white">
              <Shield className="w-6 h-6 text-bio" />
              Identity (DID)
            </h2>
            <p>
              RootlessNet uses Decentralized Identifiers (DIDs) based on Ed25519
              public keys. A typical DID looks like:
            </p>
            <div className="bg-[#0A0A0A] border border-white/5 rounded-sm p-4 font-mono text-sm break-all not-prose text-gray-400">
              did:rootless:key:z6Mkp...
            </div>
          </section>

          <div className="mt-32 pt-12 border-t border-white/5">
            <p className="text-gray-500 mb-6 font-mono text-sm uppercase tracking-widest text-center">
              Need connection?
            </p>
            <div className="flex justify-center gap-6 not-prose">
              <Link
                href="https://github.com/RootlessNet/protocol"
                className="px-6 py-3 border border-white/10 hover:border-toxic text-gray-400 hover:text-toxic font-syne font-bold text-sm transition-all flex items-center gap-2"
              >
                <Github className="w-4 h-4" /> GITHUB
              </Link>
              <Link
                href="https://discord.gg/rootlessnet"
                className="px-6 py-3 border border-white/10 hover:border-bio text-gray-400 hover:text-bio font-syne font-bold text-sm transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> DISCORD
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
