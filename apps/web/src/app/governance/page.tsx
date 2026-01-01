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
    <div className="min-h-screen bg-void font-outfit text-gray-200">
      <header className="fixed top-0 w-full z-50 bg-void/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-toxic transition-colors" />
            <span className="font-bold font-syne text-xl tracking-wide group-hover:text-toxic transition-colors">
              Rootless
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-32">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-8 font-syne text-white">
          Protocol <span className="text-toxic">Governance</span>
        </h1>

        <p className="text-xl text-gray-400 mb-16 font-light max-w-2xl">
          RootlessNet is an ownerless project. Its future is shaped by its users
          and developers through a transparent, merit-based governance process.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {principles.map((p) => (
            <div
              key={p.title}
              className="glass-panel p-6 rounded-sm border-t-2 border-toxic hover:border-toxic hover:bg-toxic/5 transition-all group"
            >
              <p.icon className="w-8 h-8 text-toxic mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold font-syne mb-3 text-lg">{p.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-light">
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        <section className="mb-24">
          <h2 className="text-3xl font-bold font-syne mb-8">
            How Decisions are Made
          </h2>
          <div className="space-y-8 relative">
            <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-white/10" />

            <div className="flex gap-6 relative">
              <div className="w-12 h-12 rounded-full bg-[#0A0A0A] border border-toxic text-toxic flex items-center justify-center shrink-0 font-bold font-syne z-10 shadow-[0_0_15px_rgba(212,255,0,0.2)]">
                1
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-bold font-syne mb-2 text-white">
                  RFC Process
                </h3>
                <p className="text-gray-400 font-light">
                  Major changes start as a Request for Comments (RFC) on{" "}
                  <span className="text-toxic">GitHub</span>, where the
                  community can discuss and refine the proposal.
                </p>
              </div>
            </div>

            <div className="flex gap-6 relative">
              <div className="w-12 h-12 rounded-full bg-[#0A0A0A] border border-toxic text-toxic flex items-center justify-center shrink-0 font-bold font-syne z-10 shadow-[0_0_15px_rgba(212,255,0,0.2)]">
                2
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-bold font-syne mb-2 text-white">
                  Implementation
                </h3>
                <p className="text-gray-400 font-light">
                  Once consensus is reached, the proposal is implemented and
                  tested in a separate branch.
                </p>
              </div>
            </div>

            <div className="flex gap-6 relative">
              <div className="w-12 h-12 rounded-full bg-[#0A0A0A] border border-toxic text-toxic flex items-center justify-center shrink-0 font-bold font-syne z-10 shadow-[0_0_15px_rgba(212,255,0,0.2)]">
                3
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-bold font-syne mb-2 text-white">
                  Release
                </h3>
                <p className="text-gray-400 font-light">
                  Following successful testing, the changes are merged into the
                  main protocol and a new version is released.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="glass-panel p-8 rounded-sm border-l-4 border-toxic flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-syne mb-2 flex items-center gap-3 text-white">
              <Scale className="w-6 h-6 text-toxic" />
              Code of Conduct
            </h2>
            <p className="text-gray-400 font-light max-w-lg">
              All contributors and community members are expected to follow our
              Code of Conduct to ensure a welcoming and inclusive environment.
            </p>
          </div>
          <Link
            href="/docs/code-of-conduct"
            className="px-6 py-3 bg-[#0A0A0A] border border-white/10 hover:border-toxic text-gray-300 hover:text-toxic font-bold font-syne transition-colors whitespace-nowrap flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> REVIEW C.O.C.
          </Link>
        </div>
      </main>
    </div>
  );
}
