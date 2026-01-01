"use client";

import { motion } from "framer-motion";

export default function SdkReferencePage() {
  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-syne font-extrabold mb-8 text-white"
      >
        SDK Reference
      </motion.h1>

      <p className="text-xl leading-relaxed font-light mb-12">
        The core class for interacting with the RootlessNet protocol.
      </p>

      <h2>RootlessNet Client</h2>

      <h3>Constructor</h3>
      <pre>
        <code>new RootlessNet(config?: RootlessNetConfig)</code>
      </pre>

      <h3>Methods</h3>

      <div className="space-y-12">
        <div>
          <h4 className="text-toxic font-mono text-lg">
            createIdentity(options?)
          </h4>
          <p>
            Generates a new Ed25519 keypair and initializes the session manager.
          </p>
          <ul className="text-sm text-gray-400">
            <li>
              <strong>Returns:</strong> <code>Promise&lt;Identity&gt;</code>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-toxic font-mono text-lg">post(text, options?)</h4>
          <p>
            Creates a signed content object and propagates it to the network.
          </p>
          <ul className="text-sm text-gray-400">
            <li>
              <strong>text:</strong> String content of the post
            </li>
            <li>
              <strong>options:</strong>{" "}
              <code>
                {'{ encryption?: "none" | "symmetric", zone?: string }'}
              </code>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-toxic font-mono text-lg">
            startConversation(recipientDid, ...)
          </h4>
          <p>
            Initiates an encrypted session with another DID using X3DH key
            agreement.
          </p>
        </div>
      </div>

      <h2 className="mt-16">Events</h2>
      <p>
        Subscribe to realtime updates using <code>client.on()</code>.
      </p>

      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-gray-200">
            <th className="py-2">Event</th>
            <th className="py-2">Description</th>
            <th className="py-2">Payload</th>
          </tr>
        </thead>
        <tbody className="text-gray-400">
          <tr className="border-b border-white/5">
            <td className="py-2 font-mono text-bio">identity:created</td>
            <td className="py-2">When a new identity is generated</td>
            <td className="py-2">
              <code>Identity</code>
            </td>
          </tr>
          <tr className="border-b border-white/5">
            <td className="py-2 font-mono text-bio">message:received</td>
            <td className="py-2">Incoming encrypted DM</td>
            <td className="py-2">
              <code>{"{ message, plaintext }"}</code>
            </td>
          </tr>
          <tr className="border-b border-white/5">
            <td className="py-2 font-mono text-bio">content:received</td>
            <td className="py-2">New public post from mesh</td>
            <td className="py-2">
              <code>ContentObject</code>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
