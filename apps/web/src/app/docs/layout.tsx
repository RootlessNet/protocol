"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const sections = [
    {
      title: "Introduction",
      items: [
        { name: "Overview", href: "/docs" },
        { name: "Getting Started", href: "/docs/getting-started" },
      ],
    },
    {
      title: "Core Concepts",
      items: [
        { name: "Architecture", href: "/docs/architecture" },
        { name: "Identity (DID)", href: "/docs/identity" },
        { name: "Cryptography", href: "/docs/cryptography" },
      ],
    },
    {
      title: "Reference",
      items: [
        { name: "SDK Reference", href: "/docs/sdk-reference" },
        { name: "CLI Reference", href: "/docs/cli-reference" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-void flex flex-col md:flex-row font-outfit text-gray-300 selection:bg-toxic selection:text-black">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-white/5 bg-[#080808] p-6 md:sticky md:top-0 md:h-screen overflow-y-auto z-20">
        <Link href="/" className="flex items-center gap-2 mb-10 group">
          <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-toxic transition-colors" />
          <span className="font-bold font-syne text-xl tracking-wide text-gray-200 group-hover:text-toxic transition-colors">
            Rootless
          </span>
        </Link>

        <nav className="space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-toxic/50 mb-4 font-mono">
                {section.title}
              </h4>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`text-sm transition-all block border-l-2 pl-3 -ml-3 py-1 ${
                          isActive
                            ? "border-toxic text-toxic font-medium bg-toxic/5"
                            : "border-transparent text-gray-400 hover:text-toxic hover:border-toxic/50"
                        }`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-16 max-w-5xl">
        <div className="prose prose-invert prose-headings:font-syne prose-headings:font-bold prose-h1:text-5xl prose-h2:text-3xl prose-p:text-gray-400 prose-code:text-toxic prose-code:bg-toxic/5 prose-code:px-1 prose-code:rounded-sm max-w-none">
          {children}
        </div>
      </main>
    </div>
  );
}
