"use client";

import { motion } from "framer-motion";

export default function CryptographyPage() {
  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-syne font-extrabold mb-8 text-white"
      >
        Cryptography
      </motion.h1>

      <p className="text-xl leading-relaxed font-light mb-12">
        The mathematical laws providing safety in a trustless environment.
      </p>

      <h2>Principals</h2>
      <p>
        We do not invent our own crypto. We implement standard, battle-tested
        algorithms provided by the `sodium` (libsodium) library suite.
      </p>

      <div className="grid md:grid-cols-2 gap-6 my-12">
        <div className="glass-panel p-6 border-l-2 border-toxic">
          <h3 className="font-bold text-white mb-2">XChaCha20-Poly1305</h3>
          <p className="text-sm text-gray-400">
            Used for authenticated encryption. Why "X"ChaCha? It has an extended
            192-bit nonce, allowing random nonce generation without risk of
            collision. This is crucial for stateless, distributed systems.
          </p>
        </div>
        <div className="glass-panel p-6 border-l-2 border-bio">
          <h3 className="font-bold text-white mb-2">Double Ratchet</h3>
          <p className="text-sm text-gray-400">
            Used for messaging sessions. Provides{" "}
            <strong>Forward Secrecy</strong> (old messages stay safe if key is
            stolen) and <strong>Break-in Recovery</strong> (future messages
            become safe again after a breach).
          </p>
        </div>
      </div>

      <h2>Hashing Strategy</h2>
      <p>
        RootlessNet uses <strong>BLAKE3</strong> for all content hashing.
      </p>
      <ul>
        <li>It is significantly faster than SHA-256 or SHA-3.</li>
        <li>
          It is a Merkle tree internally, allowing for verified streaming and
          parallelization.
        </li>
        <li>It is immune to length extension attacks.</li>
      </ul>
    </>
  );
}
