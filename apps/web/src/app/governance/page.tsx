"use client";

import Link from "next/link";
import { ChevronLeft, Users, Scale, FileText, Vote, Heart } from "lucide-react";

export default function GovernancePage() {
  const principles = [
    {
      title: "Decentralized Decision Making",
      icon: Vote,
      desc: "No single individual or entity has absolute control over the protocol evolution.",
    },
    {
      title: "Open Source Meritocracy",
      icon: Heart,
      desc: "Contributions are evaluated based on their technical merit and adherence to protocol principles.",
    },
    {
      title: "Community Led",
      icon: Users,
      desc: "The network is built by the community, for the community.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
          <span className="font-bold gradient-text">RootlessNet</span>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 gradient-text">
          Protocol Governance
        </h1>

        <p className="text-xl text-gray-400 mb-12">
          RootlessNet is an ownerless project. Its future is shaped by its users
          and developers through a transparent, merit-based governance process.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {principles.map((p) => (
            <div key={p.title} className="glass p-6 rounded-2xl">
              <p.icon className="w-8 h-8 text-primary-400 mb-4" />
              <h3 className="font-bold mb-2">{p.title}</h3>
              <p className="text-sm text-gray-400">{p.desc}</p>
            </div>
          ))}
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">How Decisions are Made</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0 font-bold text-primary-400">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">RFC Process</h3>
                <p className="text-gray-400">
                  Major changes start as a Request for Comments (RFC) on GitHub,
                  where the community can discuss and refine the proposal.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0 font-bold text-primary-400">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Implementation</h3>
                <p className="text-gray-400">
                  Once consensus is reached, the proposal is implemented and
                  tested in a separate branch.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0 font-bold text-primary-400">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Release</h3>
                <p className="text-gray-400">
                  Following successful testing, the changes are merged into the
                  main protocol and a new version is released.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="glass p-8 rounded-2xl border-l-4 border-primary-500">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Scale className="w-6 h-6 text-primary-400" />
            Code of Conduct
          </h2>
          <p className="text-gray-400 mb-6">
            All contributors and community members are expected to follow our
            Code of Conduct to ensure a welcoming and inclusive environment.
          </p>
          <Link
            href="/docs/code-of-conduct"
            className="btn-secondary inline-flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> Read Code of Conduct
          </Link>
        </div>
      </main>
    </div>
  );
}
