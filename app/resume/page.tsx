"use client";

import VisitorTracker from "@/components/VisitorTrack";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HomeContent() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-neutral-950 px-6 pt-24 text-neutral-100 font-mono selection:bg-neutral-100 selection:text-neutral-900">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <section className="flex w-full max-w-4xl flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-black text-6xl md:text-8xl uppercase tracking-tighter leading-[0.95] mb-8 bg-clay border border-neutral-600 p-8 rounded-2xl shadow-clay-lg"
        >
          Find any resume. <br />
          <span className="text-neutral-400">Master any Profile.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-lg md:text-xl text-neutral-400 font-bold uppercase tracking-widest mb-12 max-w-lg leading-relaxed bg-clay border border-neutral-600 p-6 rounded-xl shadow-clay"
        >
          Transform search results into precise resumes. Our crawler finds,
          understands, and gives you exact profiles instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Link
            href="/resume/find"
            className="group relative inline-flex items-center gap-3 bg-gradient-to-b from-neutral-100 to-neutral-300 text-neutral-900 px-10 py-5 font-black text-lg uppercase tracking-widest border border-neutral-400 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_-2px_1px_rgba(0,0,0,0.1),6px_6px_0px_0px_rgba(0,0,0,0.4)] hover:from-neutral-50 hover:to-neutral-200 hover:-translate-y-1 hover:shadow-clay-hover transition-all"
          >
            Go to Dashboard
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </motion.div>

        {/* Minimalist Footnote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1 }}
          className="mt-24 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-800"
        >
          <VisitorTracker />
        </motion.div>
      </section>
    </main>
  );
}
