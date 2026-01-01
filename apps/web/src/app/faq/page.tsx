"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Search,
  Info,
} from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      q: "Is RootlessNet a social network?",
      a: "No, RootlessNet is a protocol. Anyone can build a social network on top of it. It provides the identity, content, and messaging layers that allow these networks to be decentralized.",
    },
    {
      q: "How does it handle censorship?",
      a: "Because all content is content-addressed (via BLAKE3 hashes) and distributed over a P2P network, there is no central server to take down. As long as any node in the network has the content, it remains available.",
    },
    {
      q: "Do I need an account?",
      a: "Yes, but you create your own account locally. There is no central registry. Your 'account' is actually a Decentralized Identifier (DID) derived from your cryptographic keys.",
    },
    {
      q: "What are 'Zones'?",
      a: "Zones are topic or interest-based spaces where communities can form. Each zone can have its own moderation rules and access controls, allowing for tailored experiences without global censorship.",
    },
    {
      q: "Is it really ownerless?",
      a: "Yes. The protocol is open source and the network is peer-to-peer. There is no central company that owns the network or your data.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
          <span className="font-bold gradient-text">RootlessNet</span>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-400">
            Everything you need to know about the RootlessNet protocol.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="glass rounded-xl overflow-hidden">
              <button
                className="w-full p-6 text-left flex justify-between items-center hover:bg-white/5 transition"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-lg">{faq.q}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-primary-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-400 border-t border-white/5 pt-4 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 glass p-8 rounded-2xl text-center">
          <Info className="w-8 h-8 text-primary-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
          <p className="text-gray-400 mb-6">
            Join our community and ask anything.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="https://discord.gg/rootlessnet" className="btn-primary">
              Join Discord
            </Link>
            <Link href="/docs" className="btn-secondary">
              Read Docs
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
