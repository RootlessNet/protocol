"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Key,
  Lock,
  Globe,
  MessageSquare,
  Users,
  ChevronRight,
  Github,
  Twitter,
  BookOpen,
  Terminal,
  Zap,
  Eye,
  Database,
  Network,
} from "lucide-react";

// Hero Section
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 mesh-gradient opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse delay-500" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-300">
              Protocol v2.0.0 — Now Live
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text">RootlessNet</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light">
            A rootless, ownerless substrate for human expression.
          </p>

          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Decentralized. End-to-end encrypted. Censorship-resistant.
            <br />
            <span className="text-primary-400">
              Speech without roots. Power without owners.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/docs"
              className="btn-primary inline-flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Read the Docs
            </Link>
            <Link
              href="https://github.com/RootlessNet/protocol"
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </Link>
          </div>
        </div>

        {/* Terminal preview */}
        <div className="mt-16 max-w-2xl mx-auto animate-slide-up delay-300">
          <div className="glass rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-sm text-gray-400">terminal</span>
            </div>
            <div className="p-6 font-mono text-sm text-left">
              <div className="text-gray-400">$ bun add @rootlessnet/sdk</div>
              <div className="text-green-400 mt-2">
                ✓ Installed @rootlessnet/sdk
              </div>
              <div className="text-gray-400 mt-4">
                $ rootless identity create
              </div>
              <div className="text-primary-400 mt-2">
                🔑 Creating identity...
              </div>
              <div className="text-white mt-2">
                Your DID:{" "}
                <span className="text-accent-400">
                  did:rootless:key:z6Mk...
                </span>
              </div>
              <div className="text-gray-400 mt-4">
                $ rootless post "Hello, decentralized world!"
              </div>
              <div className="text-green-400 mt-2">
                ✓ Posted! CID: bafk...xyz
              </div>
              <div className="text-gray-500 mt-4 animate-pulse">▊</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronRight className="w-6 h-6 text-gray-400 rotate-90" />
      </div>
    </section>
  );
}

// Features Section
function Features() {
  const features = [
    {
      icon: Key,
      title: "Self-Sovereign Identity",
      description:
        "Your keys, your identity. No central authority controls who you are or what you can say.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description:
        "All communications encrypted by default. Signal protocol for messages, XChaCha20-Poly1305 for content.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Globe,
      title: "Truly Decentralized",
      description:
        "No servers to take down. No company to subpoena. The network belongs to everyone.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: MessageSquare,
      title: "Forward-Secret Messaging",
      description:
        "Double Ratchet protocol ensures even if keys are compromised, past messages stay secure.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Users,
      title: "Community Zones",
      description:
        "Create and moderate your own spaces. Local rules, no global censorship.",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: Database,
      title: "Data Portability",
      description:
        "Take your content and audience anywhere. Never be locked into a platform again.",
      color: "from-pink-500 to-rose-500",
    },
  ];

  return (
    <section className="py-24 px-6" id="features">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Built for <span className="gradient-text">Freedom</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Every feature designed with censorship-resistance and privacy as
            core principles.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass rounded-2xl p-6 glow-hover transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Architecture Section
function Architecture() {
  return (
    <section className="py-24 px-6 relative overflow-hidden" id="architecture">
      <div className="absolute inset-0 mesh-gradient opacity-30" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Protocol Architecture</span>
          </h2>
          <p className="text-xl text-gray-400">
            Modular, extensible, and built on proven cryptographic foundations.
          </p>
        </div>

        <div className="glass rounded-2xl p-8 md:p-12">
          <div className="grid gap-4">
            {/* Layer 1 */}
            <div className="glass-dark rounded-xl p-4 text-center">
              <div className="text-sm text-gray-400 mb-2">
                Application Layer
              </div>
              <div className="text-lg font-semibold">Client Applications</div>
            </div>

            {/* Layer 2 */}
            <div className="glass-dark rounded-xl p-4 text-center">
              <div className="text-sm text-gray-400 mb-2">SDK Layer</div>
              <div className="flex justify-center gap-4 flex-wrap">
                <span className="px-3 py-1 bg-primary-500/20 rounded-full text-primary-400 text-sm">
                  @rootlessnet/sdk
                </span>
              </div>
            </div>

            {/* Layer 3 */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="glass-dark rounded-xl p-4 text-center">
                <Key className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                <div className="font-semibold">Identity</div>
              </div>
              <div className="glass-dark rounded-xl p-4 text-center">
                <Database className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                <div className="font-semibold">Content</div>
              </div>
              <div className="glass-dark rounded-xl p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-green-400" />
                <div className="font-semibold">Zones</div>
              </div>
              <div className="glass-dark rounded-xl p-4 text-center">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-pink-400" />
                <div className="font-semibold">Messaging</div>
              </div>
            </div>

            {/* Layer 4 */}
            <div className="glass-dark rounded-xl p-4 text-center">
              <div className="text-sm text-gray-400 mb-2">
                Cryptographic Layer
              </div>
              <div className="flex justify-center gap-3 flex-wrap">
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                  Ed25519
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                  X25519
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                  XChaCha20-Poly1305
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                  BLAKE3
                </span>
              </div>
            </div>

            {/* Layer 5 */}
            <div className="glass-dark rounded-xl p-4 text-center">
              <div className="text-sm text-gray-400 mb-2">Network Layer</div>
              <div className="flex justify-center gap-3 flex-wrap">
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                  P2P Mesh
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                  DHT
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                  WebRTC
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                  Tor/I2P
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Code Example Section
function CodeExample() {
  const code = `import { RootlessNet } from '@rootlessnet/sdk';

// Create a client
const client = new RootlessNet();

// Create your identity
const identity = await client.createIdentity();
console.log('Your DID:', identity.did);

// Post encrypted content
const post = await client.post('Hello, RootlessNet!', {
  encryption: 'none', // or 'recipients', 'self'
  zone: 'public',
});

// Send an encrypted message
const message = client.sendSealedMessage(
  recipientPublicKey, 
  'This is a secret message'
);

// Verify content authenticity
const isValid = await client.verifyContent(post);`;

  return (
    <section className="py-24 px-6" id="quickstart">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Get Started in <span className="gradient-text">Minutes</span>
          </h2>
          <p className="text-xl text-gray-400">
            Simple, intuitive API. Powerful cryptography under the hood.
          </p>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-sm text-gray-400 font-mono">example.ts</span>
          </div>
          <pre className="p-6 overflow-x-auto">
            <code className="text-sm font-mono text-gray-300 whitespace-pre">
              {code}
            </code>
          </pre>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <Link
            href="/docs"
            className="btn-primary inline-flex items-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            Full Documentation
          </Link>
          <Link
            href="https://github.com/RootlessNet/protocol"
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Terminal className="w-5 h-5" />
            View Examples
          </Link>
        </div>
      </div>
    </section>
  );
}

// Stats Section
function Stats() {
  const stats = [
    {
      label: "Algorithms",
      value: "6+",
      description: "Cryptographic primitives",
    },
    { label: "Tests", value: "31", description: "Passing test cases" },
    { label: "Packages", value: "5", description: "Modular components" },
    { label: "Security", value: "128-bit", description: "Minimum security" },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-white mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-400">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient opacity-50" />

          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Build the <span className="gradient-text">Future</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join the RootlessNet community. Build applications that can never
              be silenced.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="https://github.com/RootlessNet/protocol"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Github className="w-5 h-5" />
                Star on GitHub
              </Link>
              <Link
                href="/docs"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Read the Docs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-xl mb-4 gradient-text">
              RootlessNet
            </h3>
            <p className="text-gray-400 text-sm">
              A rootless, ownerless substrate for human expression.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Protocol</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/docs" className="hover:text-white transition">
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/RootlessNet/protocol"
                  className="hover:text-white transition"
                >
                  GitHub
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/security"
                  className="hover:text-white transition"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link
                  href="https://discord.gg/rootlessnet"
                  className="hover:text-white transition"
                >
                  Discord
                </Link>
              </li>
              <li>
                <Link
                  href="https://twitter.com/rootlessnet"
                  className="hover:text-white transition"
                >
                  Twitter
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/contributing"
                  className="hover:text-white transition"
                >
                  Contributing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/license" className="hover:text-white transition">
                  MIT License
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/governance"
                  className="hover:text-white transition"
                >
                  Governance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10">
          <p className="text-gray-400 text-sm">
            © 2026 RootlessNet Community. Open source under MIT License.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link
              href="https://github.com/RootlessNet"
              className="text-gray-400 hover:text-white transition"
            >
              <Github className="w-5 h-5" />
            </Link>
            <Link
              href="https://twitter.com/rootlessnet"
              className="text-gray-400 hover:text-white transition"
            >
              <Twitter className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Page
export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <Stats />
      <Architecture />
      <CodeExample />
      <CTA />
      <Footer />
    </main>
  );
}
