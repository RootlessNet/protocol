"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronDown, ChevronUp, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 font-syne text-white">
            FAQ
          </h1>
          <p className="text-xl text-gray-400 font-light">
            Everything you need to know about the{" "}
            <span className="text-toxic">RootlessNet</span> protocol.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="glass-panel rounded-sm overflow-hidden group border border-white/5 hover:border-toxic/30 transition-all"
            >
              <button
                className="w-full p-6 text-left flex justify-between items-center"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-bold font-syne text-lg group-hover:text-toxic transition-colors">
                  {faq.q}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-toxic" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-toxic" />
                )}
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-gray-400 font-light leading-relaxed border-t border-white/5 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-24 p-8 rounded-sm bg-[#080808] border border-white/5 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-toxic to-transparent opacity-20" />
          <Info className="w-8 h-8 text-toxic mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-syne mb-2 text-white">
            Still have questions?
          </h2>
          <p className="text-gray-500 mb-8">
            Join the collective in the deep web.
          </p>
          <div className="flex justify-center gap-6">
            <Link
              href="https://discord.gg/rootlessnet"
              className="px-6 py-3 bg-toxic text-black font-bold font-syne hover:bg-toxic-dim transition-colors"
            >
              JOIN DISCORD
            </Link>
            <Link
              href="/docs"
              className="px-6 py-3 border border-white/10 hover:border-white text-gray-300 hover:text-white font-bold font-syne transition-colors"
            >
              READ DOCS
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
