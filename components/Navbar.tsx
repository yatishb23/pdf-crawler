"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isResumePath = pathname.startsWith("/resume");

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl px-4 md:px-6 py-3 backdrop-blur-xl transition-colors duration-300 ${
        isResumePath
          ? "rounded-xl border border-neutral-600 bg-clay shadow-clay"
          : "rounded-2xl border border-zinc-800/50 bg-zinc-950/70 shadow-2xl shadow-black/50"
      }`}
    >
      <div className="flex items-center justify-between">
        <Link
          className="flex items-center gap-2.5 md:gap-3"
          href={isResumePath ? "/resume" : "/"}
          onClick={closeMenu}
        >
          <div className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-xl flex items-center justify-center -rotate-6 shadow-lg shadow-white/10">
            <span className="text-black font-black text-xl md:text-2xl rotate-6">
              {isResumePath ? "P" : "B"}
            </span>
          </div>
          <span
            className={`text-lg md:text-2xl tracking-tight text-white ${isResumePath ? "font-black uppercase tracking-tighter" : "font-serif"}`}
          >
            {isResumePath ? "Person Crawler" : "Book Crawler"}
          </span>
        </Link>

        <div
          className={`hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.25em] ${isResumePath ? "text-neutral-300" : "text-zinc-600"}`}
        >
          <Link
            href="/"
            className="hover:text-white transition-all transform hover:scale-105"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="hover:text-white transition-all transform hover:scale-105"
          >
            Concept
          </Link>
          <Link
            href={isResumePath ? "/" : "/resume"}
            className={`transition-all transform hover:scale-105 px-3 py-1.5 ${
              isResumePath
                ? "bg-clay text-white border border-neutral-500 rounded-lg shadow-clay-sm"
                : "hover:text-white bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 rounded-md"
            }`}
          >
            {isResumePath ? "Scrap Book" : "Scrap Person"}
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center h-10 w-10 border border-neutral-600 text-zinc-300 hover:text-white hover:border-neutral-400 rounded-lg transition"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-neutral-700">
          <div className="flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">
            <Link
              href="/"
              onClick={closeMenu}
              className="px-3 py-2 hover:bg-zinc-900 hover:text-white transition"
            >
              Home
            </Link>
            <Link
              href="/about"
              onClick={closeMenu}
              className="px-3 py-2 hover:bg-zinc-900 hover:text-white transition"
            >
              Concept
            </Link>
            <Link
              href={isResumePath ? "/" : "/resume"}
              onClick={closeMenu}
              className="px-3 py-2 hover:bg-zinc-900 hover:text-white transition text-indigo-400"
            >
              {isResumePath ? "Scrap Book" : "Scrap Person"}
            </Link>
          </div>
        </div>
      )}
    </motion.nav>
  );
}
