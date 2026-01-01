"use client";

import { Zap, Shield, Globe2 } from "lucide-react";
import { motion } from "framer-motion";

export default function DocsOverviewPage() {
  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-syne font-extrabold mb-8 text-white"
      >
        Documentation
      </motion.h1>

      <p className="text-xl leading-relaxed font-light mb-12">
        RootlessNet is a{" "}
        <strong className="text-toxic">
          sovereign communication substrate
        </strong>
        . It provides the cryptographic and networking primitives to build
        applications that are structurally immune to censorship.
      </p>

      <div className="grid sm:grid-cols-2 gap-6 not-prose mb-16">
        <div className="glass-panel p-6 rounded-sm border-l-2 border-toxic group hover:bg-toxic/5 transition-colors">
          <Zap className="w-8 h-8 text-toxic mb-4" />
          <h3 className="font-syne font-bold text-white text-xl mb-2">
            Protocol First
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Not a platform. A set of rules for peers to speak freely. Build
            whatever you want on top.
          </p>
        </div>
        <div className="glass-panel p-6 rounded-sm border-l-2 border-bio group hover:bg-bio/5 transition-colors">
          <Shield className="w-8 h-8 text-bio mb-4" />
          <h3 className="font-syne font-bold text-white text-xl mb-2">
            Attack Resistant
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Designed to survive network partitions, DDOS, and state-level
            firewalling.
          </p>
        </div>
      </div>

      <h2>Design Philosophy</h2>
      <p>
        The internet was born distributed but grew centralized. We are returning
        to the roots—or rather, cutting them.
      </p>
      <ul>
        <li>
          <strong>Identity over Accounts:</strong> You carry your user ID (DID)
          with you. It lives in your keys, not our database.
        </li>
        <li>
          <strong>Content over connection:</strong> Data is addressed by what it
          is (Hash), not where it is (URL).
        </li>
        <li>
          <strong>Encryption over Trust:</strong> Don't trust the server.
          Encrypt the payload.
        </li>
      </ul>
    </>
  );
}
