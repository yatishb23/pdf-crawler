"use client";

import { motion } from "framer-motion";
import { Search, Globe, FileText, Shield, Zap, Database } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const steps = [
    {
      icon: <Search className="text-zinc-400" size={24} />,
      title: "Discovery",
      description: "Our crawler traverses deep indexes to identify high-quality PDF publications that are often hidden from surface-level search results."
    },
    {
      icon: <Globe className="text-zinc-400" size={24} />,
      title: "Access",
      description: "We use sophisticated proxy layers to bypass CORS restrictions and fetch content from institutional archives securely and reliably."
    },
    {
      icon: <Database className="text-zinc-400" size={24} />,
      title: "Curation",
      description: "Every file is analyzed for relevance, ensuring our library remains a high-signal environment for digital intelligence."
    }
  ];

  return (
    <main className="relative flex min-h-dvh flex-col bg-zinc-950 text-zinc-200 selection:bg-zinc-200 selection:text-zinc-950 overflow-x-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-x-0 top-0 -z-10 h-150 w-full [background:radial-gradient(circle_at_50%_-10%,#27272a_0%,transparent_100%)] opacity-30" />
      
      <div className="mx-auto w-full max-w-5xl px-8 pt-40 pb-32">
        <header className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-serif text-6xl md:text-7xl tracking-tight leading-none mb-8 text-white">
              The Mission<span className="text-zinc-600">.</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-500 max-w-3xl leading-relaxed font-light mb-12">
              We are building a seamless gateway to the world&apos;s digital archives, 
              connecting researchers and enthusiasts with curated intelligence.
            </p>

            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "#f4f4f5" }}
                whileTap={{ scale: 0.98 }}
                className="bg-zinc-100 text-zinc-950 px-10 py-4 rounded-full font-semibold text-sm transition-all shadow-xl uppercase tracking-widest"
              >
                Go to Dashboard
              </motion.button>
            </Link>
          </motion.div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
              className="group p-8 bg-zinc-900/20 border border-zinc-900/50 rounded-3xl hover:border-zinc-700 transition-all duration-500"
            >
              <div className="mb-6 p-4 bg-zinc-950 rounded-2xl w-fit border border-zinc-800/50 group-hover:border-zinc-500 transition-colors">
                {step.icon}
              </div>
              <h3 className="text-xl font-medium mb-4 text-white">{step.title}</h3>
              <p className="text-zinc-500 leading-relaxed font-light">
                {step.description}
              </p>
            </motion.div>
          ))}
        </section>

        <section className="border-t border-zinc-900 pt-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-4xl mb-8 text-white">Technical Architecture</h2>
              <p className="text-zinc-500 text-lg leading-relaxed font-light mb-6">
                Our system utilizes a distributed crawling architecture built on Next.js 14. 
                When you search, we query structured indexes and dynamic endpoints in real-time.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: <Zap size={16} />, text: "Real-time PDF rendering via PDF.js" },
                  { icon: <Shield size={16} />, text: "Sophisticated CORS proxy with MIME validation" },
                  { icon: <FileText size={16} />, text: "Automated relevance ranking & metadata extraction" }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-zinc-400 font-light">
                    <span className="text-zinc-600">{item.icon}</span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="aspect-video bg-zinc-900/10 border border-zinc-900 rounded-3xl flex items-center justify-center relative overflow-hidden group"
            >
               <div className="absolute inset-0 bg-zinc-950/20 group-hover:bg-transparent transition-colors duration-700" />
               <div className="flex flex-col items-center gap-4 text-zinc-700 uppercase tracking-[0.4em] text-[10px] font-bold">
                 <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full animate-pulse"></div>
                 System Visualization
               </div>
            </motion.div>
          </div>
        </section>

        <footer className="mt-40 flex flex-col items-center text-center py-20 border-t border-zinc-900">
          <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-800 mb-8">
            Digital Archive Project · 2026
          </div>
          <p className="text-zinc-600 text-sm max-w-sm font-light">
            Dedicated to the pursuit of knowledge and the democratization of information.
          </p>
        </footer>
      </div>
    </main>
  );
}
