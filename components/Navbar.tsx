"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl rounded-2xl border border-zinc-800/50 bg-zinc-950/70 px-4 md:px-6 py-3 backdrop-blur-xl shadow-2xl shadow-black/50"
    >
      <div className="flex items-center justify-between">
        <Link className="flex items-center gap-2.5 md:gap-3" href="/" onClick={closeMenu}>
          <div className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-xl flex items-center justify-center -rotate-6 shadow-lg shadow-white/10">
            <span className="text-black font-black text-xl md:text-2xl rotate-6">B</span>
          </div>
          <span className="text-lg md:text-2xl font-serif tracking-tight text-white">Book Crawler</span>
        </Link>

        <div className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">
          <Link href="/" className="hover:text-white transition-all transform hover:scale-105">Home</Link>
          <Link href="/about" className="hover:text-white transition-all transform hover:scale-105">Concept</Link>
        </div>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 transition"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-zinc-800/80">
          <div className="flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">
            <Link
              href="/"
              onClick={closeMenu}
              className="rounded-lg px-3 py-2 hover:bg-zinc-900 hover:text-white transition"
            >
              Home
            </Link>
            <Link
              href="/about"
              onClick={closeMenu}
              className="rounded-lg px-3 py-2 hover:bg-zinc-900 hover:text-white transition"
            >
              Concept
            </Link>
          </div>
        </div>
      )}
    </motion.nav>
  )
}
