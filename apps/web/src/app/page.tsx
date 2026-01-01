"use client";

import { motion } from "framer-motion";
import {
  Network,
  Shield,
  Globe2,
  Cpu,
  Layers,
  Share2,
  ArrowRight,
  Terminal,
  Code2,
} from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden text-gray-200 selection:bg-[#D4FF00] selection:text-black">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-[#050505] to-[#050505]" />
        <div className="bg-grid-pattern absolute inset-0 opacity-20" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#D4FF00] rounded-sm transform rotate-45" />
          <span className="font-syne font-bold text-xl tracking-wide">
            ROOTLESS
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <Link href="/docs" className="hover:text-[#D4FF00] transition-colors">
            Documentation
          </Link>
          <Link
            href="/governance"
            className="hover:text-[#D4FF00] transition-colors"
          >
            Governance
          </Link>
          <Link href="/faq" className="hover:text-[#D4FF00] transition-colors">
            FAQ
          </Link>
          <a
            href="https://github.com/RootlessNet/protocol"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#D4FF00] transition-colors"
          >
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto flex flex-col items-start justify-center min-h-[85vh]">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-6 max-w-4xl"
        >
          <motion.div
            variants={fadeInUp}
            className="flex items-center gap-3 text-[#D4FF00] font-mono text-xs tracking-widest uppercase mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-[#D4FF00] animate-pulse" />
            System Operational // v2.0.0
          </motion.div>

          {/* Huge Staggered Typography */}
          <div className="flex flex-col gap-2">
            <motion.h1
              variants={fadeInUp}
              className="text-6xl md:text-8xl font-syne font-extrabold leading-[0.9] tracking-tighter"
            >
              SPEECH
            </motion.h1>
            <motion.h1
              variants={fadeInUp}
              className="text-6xl md:text-8xl font-syne font-extrabold leading-[0.9] tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500"
            >
              WITHOUT
            </motion.h1>
            <motion.h1
              variants={fadeInUp}
              className="text-6xl md:text-8xl font-syne font-extrabold leading-[0.9] tracking-tighter text-[#D4FF00]"
            >
              ROOTS
            </motion.h1>
          </div>

          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-400 max-w-2xl font-light leading-relaxed pt-6 font-outfit"
          >
            The ownerless substrate for human expression. <br />
            <span className="text-gray-200 font-normal">
              Censorship-resistant. End-to-end encrypted. Forever.
            </span>
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 pt-8">
            <Link
              href="/docs"
              className="group relative px-8 py-4 bg-[#D4FF00] text-black font-bold font-syne text-lg rounded-sm overflow-hidden transition-transform hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center gap-2">
                INITIALIZE IDENTITY{" "}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <a
              href="https://github.com/RootlessNet/protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border border-gray-700 hover:border-[#D4FF00] text-gray-300 hover:text-[#D4FF00] font-bold font-syne text-lg rounded-sm transition-all hover:bg-[#D4FF00]/5"
            >
              VIEW SOURCE
            </a>
          </motion.div>
        </motion.div>

        {/* Abstract Deco Element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute top-1/2 right-0 -z-10 w-[600px] h-[600px] bg-[#D4FF00]/5 rounded-full blur-[100px] pointer-events-none"
        />
      </section>

      {/* Protocol Architecture Grid */}
      <section className="relative z-10 py-24 px-6 border-t border-gray-900 bg-[#070707]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl font-syne font-bold mb-4">
              PROTOCOL ARCHITECTURE
            </h2>
            <div className="h-1 w-20 bg-[#D4FF00]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-[#D4FF00]" />}
              title="Self-Sovereign Identity"
              description="Your keys, your identity. No central authority controls who you are or what you can say. DID-based authentication built-in."
            />
            <FeatureCard
              icon={<Network className="w-8 h-8 text-[#00F0FF]" />}
              title="Truly Decentralized"
              description="No servers to take down. No company to subpoena. The network belongs to everyone. P2P message propagation."
            />
            <FeatureCard
              icon={<Globe2 className="w-8 h-8 text-[#D4FF00]" />}
              title="Community Zones"
              description="Create and moderate your own spaces. Local rules, no global censorship. Federated trust models."
            />
            <FeatureCard
              icon={<Cpu className="w-8 h-8 text-[#D4FF00]" />}
              title="XChaCha20-Poly1305"
              description="Military-grade encryption for all content. Verify authenticity without compromising privacy."
            />
            <FeatureCard
              icon={<Layers className="w-8 h-8 text-[#00F0FF]" />}
              title="Forward Secrecy"
              description="Double Ratchet protocol ensures that even if keys are compromised today, past messages remain secure forever."
            />
            <FeatureCard
              icon={<Share2 className="w-8 h-8 text-[#D4FF00]" />}
              title="Data Portability"
              description="Take your content and audience anywhere. Never be locked into a platform again. You own the graph."
            />
          </div>
        </div>
      </section>

      {/* Developer API Section */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Terminal className="w-6 h-6 text-[#D4FF00]" />
              <span className="font-mono text-[#D4FF00] text-sm">
                DEVELOPER API
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-syne font-bold mb-8 leading-tight">
              BUILT FOR BUILDERS,
              <br />
              NOT JUST USERS.
            </h2>
            <p className="text-gray-400 text-lg mb-8 font-light">
              RootlessNet isn't just a chat app; it's a substrate. Build
              censorship-resistant social networks, marketplaces, or
              coordination tools with a few lines of code.
            </p>

            <ul className="space-y-4 font-outfit">
              {[
                "Zero infrastructure setup required",
                "Built-in cryptographic identity management",
                "Automatic peer discovery and routing",
                "Works in Node.js, Browser, and React Native",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <div className="w-1.5 h-1.5 bg-[#D4FF00]" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Link
                href="/docs"
                className="text-[#D4FF00] underline underline-offset-4 hover:bg-[#D4FF00] hover:text-black transition-colors px-1"
              >
                Explore the SDK Documentation
              </Link>
            </div>
          </div>

          <div className="glass-panel p-1 rounded-lg shadow-2xl overflow-hidden border-toxic relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4FF00] to-transparent opacity-50" />

            <div className="bg-[#080808] p-6 rounded-md font-mono text-sm overflow-x-auto">
              <div className="flex gap-2 mb-4 opacity-50">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>

              <div className="text-gray-300 space-y-2">
                <div>
                  <span className="text-purple-400">import</span>{" "}
                  <span className="text-yellow-200">
                    {"{"} RootlessNet {"}"}
                  </span>{" "}
                  <span className="text-purple-400">from</span>{" "}
                  <span className="text-green-400">'@rootlessnet/sdk'</span>;
                </div>
                <div className="h-2" />
                <div className="text-gray-500">// Initialize the node</div>
                <div>
                  <span className="text-purple-400">const</span> client ={" "}
                  <span className="text-purple-400">new</span>{" "}
                  <span className="text-yellow-200">RootlessNet</span>();
                </div>
                <div className="h-2" />
                <div className="text-gray-500">
                  // Create self-sovereign identity
                </div>
                <div>
                  <span className="text-purple-400">const</span> identity ={" "}
                  <span className="text-purple-400">await</span> client.
                  <span className="text-blue-400">createIdentity</span>();
                </div>
                <div>
                  <span className="text-blue-200">console</span>.
                  <span className="text-blue-400">log</span>(
                  <span className="text-green-400">'My DID:'</span>,
                  identity.did);
                </div>
                <div className="h-2" />
                <div className="text-gray-500">// Publish to the mesh</div>
                <div>
                  <span className="text-purple-400">await</span> client.
                  <span className="text-blue-400">post</span>(
                  <span className="text-green-400">
                    'Hello, Rootless World!'
                  </span>
                  , {"{"}
                  <br />
                  &nbsp;&nbsp;encryption:{" "}
                  <span className="text-green-400">'none'</span>,<br />
                  &nbsp;&nbsp;zone:{" "}
                  <span className="text-green-400">'public'</span>
                  <br />
                  {"}"});
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-900 bg-[#030303] text-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-syne font-bold text-xl text-white mb-4">
              ROOTLESS<span className="text-[#D4FF00]">NET</span>
            </h3>
            <p className="text-gray-500 max-w-sm">
              An open-source, community-governed protocol for uncensorable
              communication. Built for the era of digital sovereignty.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">PROTOCOL</h4>
            <ul className="space-y-2 text-gray-500">
              <li>
                <Link href="/docs" className="hover:text-[#D4FF00]">
                  Documentation
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-[#D4FF00]">
                  Specs & Standards
                </a>
              </li>
              <li>
                <Link href="/security" className="hover:text-[#D4FF00]">
                  Security Audit
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/RootlessNet/protocol"
                  className="hover:text-[#D4FF00]"
                >
                  Source Code
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">COMMUNITY</h4>
            <ul className="space-y-2 text-gray-500">
              <li>
                <a href="#" className="hover:text-[#D4FF00]">
                  Discord Server
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#D4FF00]">
                  Governance Forum
                </a>
              </li>
              <li>
                <Link href="/governance" className="hover:text-[#D4FF00]">
                  DAO Proposals
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-[#D4FF00]">
                  Twitter / X
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-gray-900 text-gray-600 flex justify-between">
          <p>© 2026 RootlessNet Project. MIT Licensed.</p>
          <div className="flex gap-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Network Status: Online</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-panel p-8 rounded-sm hover:border-[#D4FF00]/50 transition-colors group cursor-default">
      <div className="mb-6 bg-white/5 w-16 h-16 rounded-full flex items-center justify-center group-hover:bg-[#D4FF00]/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-syne font-bold text-white mb-3 group-hover:text-[#D4FF00] transition-colors">
        {title}
      </h3>
      <p className="text-gray-400 font-light leading-relaxed">{description}</p>
    </div>
  );
}
