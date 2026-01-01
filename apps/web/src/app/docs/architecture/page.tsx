"use client";

import { motion } from "framer-motion";

export default function ArchitecturePage() {
  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-syne font-extrabold mb-8 text-white"
      >
        Architecture
      </motion.h1>

      <p className="text-xl leading-relaxed font-light mb-12">
        RootlessNet is a layered protocol stack designed to function without any
        centralized coordinators.
      </p>

      <div className="glass-panel p-8 rounded-sm mb-12 border border-white/10">
        <pre className="font-mono text-xs md:text-sm text-gray-300 leading-relaxed overflow-x-auto">
          {`┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                       │
│              (Chat Apps, Social Feeds, DAOs)                 │
├─────────────────────────────────────────────────────────────┤
│                    Protocol Layer                            │
│   Identity   │   Content   │   Zones   │   Messaging        │
├─────────────────────────────────────────────────────────────┤
│                    Cryptographic Layer                       │
│    Ed25519   │  XChaCha20  │   BLAKE3  │     X3DH           │
├─────────────────────────────────────────────────────────────┤
│                    Transport Layer                           │
│   P2P Mesh   │   WebRTC    │   Relays  │   Local Storage    │
└─────────────────────────────────────────────────────────────┘`}
        </pre>
      </div>

      <h2>Components</h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-white font-bold text-xl">
            1. The Transport Layer
          </h3>
          <p>
            The foundation is a peer-to-peer mesh. Nodes discover each other via
            DHT (Distributed Hash Table) and gossip protocol. When you publish a
            message, you aren't sending it to a server; you are whispering it to
            your neighbors, who whisper it to theirs.
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold text-xl">
            2. The Cryptographic Layer
          </h3>
          <p>
            Nothing is trusted. Every single packet is signed. Every private
            message is encrypted. We use a rigorous mix of:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-gray-400">
            <li>
              <strong className="text-toxic">Ed25519</strong> for signatures
              (Authentication)
            </li>
            <li>
              <strong className="text-toxic">X25519</strong> for key exchange
              (ECDH)
            </li>
            <li>
              <strong className="text-toxic">XChaCha20-Poly1305</strong> for
              symmetric encryption (Confidentiality)
            </li>
            <li>
              <strong className="text-toxic">BLAKE3</strong> for content hashing
              (Integrity)
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
