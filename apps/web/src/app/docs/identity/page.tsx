"use client";

import { motion } from "framer-motion";

export default function IdentityPage() {
  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-syne font-extrabold mb-8 text-white"
      >
        Identity (DID)
      </motion.h1>

      <p className="text-xl leading-relaxed font-light mb-12">
        RootlessNet uses <strong>Decentralized Identifiers (DIDs)</strong> to
        anchor identity without a central registry.
      </p>

      <h2>The Key Pair</h2>
      <p>
        Your identity is derived from an <strong>Ed25519</strong> key pair. This
        is a high-speed, high-security elliptic curve signature scheme.
      </p>
      <ul>
        <li>
          <strong>Private Key:</strong> Kept locally on your device. Never
          leaves. Used to sign every packet you send.
        </li>
        <li>
          <strong>Public Key:</strong> Distributed to peers. Used by others to
          verify your signatures.
        </li>
      </ul>

      <div className="bg-[#0A0A0A] p-4 border-l-2 border-toxic my-6">
        <p className="text-sm font-mono text-toxic mb-0">
          Unlike email or Web2 usernames, your ID cannot be taken away by an
          admin. You are the admin.
        </p>
      </div>

      <h2>DID Format</h2>
      <p>
        We use the <code>did:key</code> method for simplicity and portability.
      </p>

      <div className="bg-black/50 p-4 rounded-sm font-mono text-sm text-gray-400 border border-white/5 break-all">
        did:key:z6MkpTHR8VNsBxYAAWhut2Geadd9jSwuQRJxcj8dkJnM8b8y
      </div>

      <h2 className="mt-12">Verification Flow</h2>
      <ol>
        <li>User A signs a message payload with their Private Key.</li>
        <li>User B receives the message + signature.</li>
        <li>User B extracts the Public Key from User A's DID.</li>
        <li>User B mathematically verifies the signature.</li>
        <li>If valid, the network accepts the message.</li>
      </ol>
    </>
  );
}
