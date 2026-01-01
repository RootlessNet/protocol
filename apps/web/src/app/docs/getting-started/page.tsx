"use client";

import { Terminal, Code2 } from "lucide-react";
import { motion } from "framer-motion";

export default function GettingStartedPage() {
  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-syne font-extrabold mb-8 text-white"
      >
        Getting Started
      </motion.h1>

      <p className="text-xl leading-relaxed font-light mb-12">
        Initialize your node and join the mesh.
      </p>

      <section className="mb-16">
        <h2 className="flex items-center gap-3 text-white">
          <Terminal className="w-6 h-6 text-toxic" />
          Installation
        </h2>
        <p>
          RootlessNet is available as a TypeScript SDK and a CLI tool. We
          recommend using <code>bun</code>.
        </p>

        <div className="bg-[#0A0A0A] border border-white/5 rounded-sm p-6 font-mono text-sm not-prose mb-6 relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-toxic" />
          <div className="text-gray-500 mb-2">
            # Install the SDK for your app
          </div>
          <div className="text-gray-200 mb-4">
            bun add <span className="text-toxic">@rootlessnet/sdk</span>
          </div>

          <div className="text-gray-500 mb-2"># Install the CLI globally</div>
          <div className="text-gray-200">
            bun add -g <span className="text-bio">@rootlessnet/cli</span>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="flex items-center gap-3 text-white">
          <Code2 className="w-6 h-6 text-bio" />
          Quick Start: Hello World
        </h2>
        <p>
          Create an identity and publish your first message to the public zone.
        </p>

        <div className="glass-panel p-6 rounded-sm border border-white/5 font-mono text-sm not-prose overflow-x-auto">
          <pre className="text-gray-300">
            <span className="text-purple-400">import</span> {"{"} RootlessNet{" "}
            {"}"} <span className="text-purple-400">from</span>{" "}
            <span className="text-green-400">'@rootlessnet/sdk'</span>;
            <span className="text-gray-500">// 1. Initialize the client</span>
            <span className="text-purple-400">const</span> client ={" "}
            <span className="text-purple-400">new</span>{" "}
            <span className="text-yellow-200">RootlessNet</span>();
            <span className="text-gray-500">
              // 2. Create a fresh identity (saves to local storage)
            </span>
            <span className="text-purple-400">const</span> identity ={" "}
            <span className="text-purple-400">await</span> client.
            <span className="text-blue-400">createIdentity</span>();
            <span className="text-blue-200">console</span>.
            <span className="text-blue-400">log</span>(
            <br />
            <span className="text-green-400">
              `Active as: ${"$"}
              {"{"}identity.did{"}"}`
            </span>
            );
            <span className="text-gray-500">// 3. Publish content</span>
            <span className="text-purple-400">const</span> post ={" "}
            <span className="text-purple-400">await</span> client.
            <span className="text-blue-400">post</span>(
            <span className="text-green-400">'Hello from the other side.'</span>
            );
            <span className="text-blue-200">console</span>.
            <span className="text-blue-400">log</span>(
            <br />
            <span className="text-green-400">
              `Published CID: ${"$"}
              {"{"}post.id{"}"}`
            </span>
            );
          </pre>
        </div>
      </section>
    </>
  );
}
