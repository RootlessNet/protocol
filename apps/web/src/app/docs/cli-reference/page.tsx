"use client";

import { motion } from "framer-motion";
import { Copy } from "lucide-react";

export default function CliReferencePage() {
  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-syne font-extrabold mb-8 text-white"
      >
        CLI Reference
      </motion.h1>

      <p className="text-xl leading-relaxed font-light mb-12">
        Control your node directly from the terminal.
      </p>

      <h2>Global Usage</h2>
      <div className="bg-[#0A0A0A] p-4 rounded-sm border border-white/5 font-mono text-sm mb-8">
        <span className="text-toxic">rootless</span> [command] [options]
      </div>

      <div className="space-y-12">
        <section>
          <h3 className="text-2xl font-syne font-bold text-white mb-4 border-b border-white/10 pb-2">
            Identity Management
          </h3>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <code className="text-toxic font-bold">identity create</code>
              </div>
              <p className="text-sm text-gray-400 mb-2">
                Generates a new DID and creates a local keystore.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-2">
                <code className="text-toxic font-bold">identity export</code>
                <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-gray-300">
                  --password &lt;pass&gt;
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Exports your private keys to a highly encrypted JSON file.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-syne font-bold text-white mb-4 border-b border-white/10 pb-2">
            Networking
          </h3>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <code className="text-bio font-bold">node start</code>
              </div>
              <p className="text-sm text-gray-400 mb-2">
                Boots up a full P2P node. Begins gossiping with peers and
                syncing state.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-syne font-bold text-white mb-4 border-b border-white/10 pb-2">
            Content
          </h3>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <code className="text-white font-bold">post "Message"</code>
              </div>
              <p className="text-sm text-gray-400 mb-2">
                Publishes a text post to the public timeline.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
