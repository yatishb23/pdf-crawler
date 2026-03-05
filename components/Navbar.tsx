"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex w-[90%] max-w-5xl items-center justify-between px-6 py-3 backdrop-blur-xl bg-zinc-950/70 border border-zinc-800/50 rounded-2xl shadow-2xl shadow-black/50"
    >
      <Link className="flex items-center gap-3" href="/">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center -rotate-6 shadow-lg shadow-white/10">
          <span className="text-black font-black text-2xl rotate-6">B</span>
        </div>
        <span className="text-2xl font-serif tracking-tight text-white">Book Crawler</span>
      </Link>
      
      <div className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">
        <Link href="/" className="hover:text-white transition-all transform hover:scale-105">Home</Link>
        <Link href="/about" className="hover:text-white transition-all transform hover:scale-105">Concept</Link>
      </div>
    </motion.nav>
  )
}
