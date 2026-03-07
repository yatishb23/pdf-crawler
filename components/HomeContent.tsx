"use client"

import VisitorTracker from "@/components/VisitorTrack";
import { motion } from "framer-motion"
import Link from "next/link"

export default function HomeContent() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-black px-6 pt-24 text-white selection:bg-white selection:text-black">
      <div className="absolute inset-x-0 top-0 -z-10 h-200 w-full [background:radial-gradient(circle_at_50%_-10%,#18181b_0%,transparent_70%)] opacity-50" />

      <section className="flex w-full max-w-3xl flex-col items-center text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-serif text-6xl md:text-8xl tracking-tight leading-[0.95] mb-8"
        >
          Read any book. <br /> 
          <span className=" opacity-70 text-zinc-400">Master any PDF.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-lg md:text-xl text-zinc-500 mb-12 max-w-lg leading-relaxed mix-blend-plus-lighter"
        >
          Transform thousands of pages into instant knowledge. Our
          crawler reads, understands, and extracts exactly what you need.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Link 
            href="/dashboard"
            className="group relative inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-2xl font-bold text-base hover:bg-zinc-200 transition-all duration-500 active:scale-95 shadow-2xl shadow-white/5"
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
          <VisitorTracker/>
        </motion.div>
      </section>
    </main>
  );
}
