"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Download,
  ExternalLink,
  FileText,
  Loader2,
} from "lucide-react";

// ... (pdfjsLib initialization remains the same)
let pdfjsLib: any = null;
if (typeof window !== "undefined") {
  import("pdfjs-dist").then((pdfjs) => {
    pdfjsLib = pdfjs;
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.mjs",
      import.meta.url,
    ).toString();
  });
}

interface BookResult {
  title: string;
  url: string;
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<BookResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/v1/getBooks?q=${encodeURIComponent(searchQuery)}`,
      );
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh flex-col bg-black text-white selection:bg-white selection:text-black overflow-x-hidden">
            {/* Exact Background Match */}
           {" "}
      <div className="absolute inset-x-0 top-0 -z-10 h-200 w-full [background:radial-gradient(circle_at_50%_-10%,#18181b_0%,transparent_70%)] opacity-50" />
           {" "}
      {/* Main Container - constrained to max-w-3xl for the 'Home' feel */}     {" "}
      <div className="mx-auto w-full max-w-5xl px-6 pt-32 pb-20">
                        {/* Header - Same width and alignment as Home hero */} 
             {" "}
        <header className="flex flex-col items-center text-center mb-16">
                   {" "}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
                       {" "}
            <h1 className="font-serif text-6xl md:text-7xl tracking-tight leading-none mb-6">
                            Library
              <span className="opacity-70 text-zinc-400">.</span>         
               {" "}
            </h1>
                       {" "}
            <p className="text-lg md:text-xl text-zinc-500 mb-8 max-w-lg leading-relaxed mix-blend-plus-lighter italic">
                            Access your knowledge base.            {" "}
            </p>
                     {" "}
          </motion.div>
                   {" "}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="group inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-2xl font-bold text-base hover:bg-zinc-200 transition-all duration-500 shadow-2xl shadow-white/5"
          >
                        <Plus size={18} strokeWidth={3} />            Upload PDF
                     {" "}
          </motion.button>
                 {" "}
        </header>
                {/* Search Bar - Mirrored sizing to Home CTA */}       {" "}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative w-full mb-24"
        >
                   {" "}
          <form onSubmit={handleSearch} className="relative group">
                       {" "}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors">
                            <Search size={22} />           {" "}
            </div>
                       {" "}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find a document..."
              className="w-full bg-zinc-900/20 backdrop-blur-md border border-zinc-800/50 rounded-2xl pl-16 pr-32 py-6 text-xl placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 transition-all selection:bg-zinc-700"
            />
                       {" "}
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
            >
                           {" "}
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Search"
              )}
                         {" "}
            </button>
                     {" "}
          </form>
                 {" "}
        </motion.div>
                {/* Results Grid - Using max-w-3xl logic */}       {" "}
        <AnimatePresence mode="wait">
                   {" "}
          {results.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-8"
            >
                           {" "}
              {results.map((book, i) => (
                <PDFCard key={i} book={book} />
              ))}
                         {" "}
            </motion.div>
          ) : (
            !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col items-center py-20 text-zinc-800 border-t border-zinc-900"
              >
                             {" "}
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em]">
                                 {" "}
                  <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full"></div> 
                                <span>Archive Empty</span>             {" "}
                </div>
                           {" "}
              </motion.div>
            )
          )}
                 {" "}
        </AnimatePresence>
           {" "}
      </div>
    </main>
  );
}

function PDFCard({ book }: { book: BookResult }) {
  // ... (Same logic for observer and pdf render)
  // [Internal logic remains identical to previous version]
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || thumbnail || !pdfjsLib) return;
    const render = async () => {
      try {
        const proxiedUrl = `/api/v1/proxyPdf?url=${encodeURIComponent(book.url)}`;
        const loadingTask = pdfjsLib.getDocument({
          url: proxiedUrl,
          disableStream: true,
          disableRange: true,
        });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement("canvas");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: canvas.getContext("2d")!, viewport })
          .promise;
        setThumbnail(canvas.toDataURL());
      } catch (e) {}
    };
    render();
  }, [isVisible, book.url, thumbnail]);

  return (
    <motion.div
      ref={containerRef}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className="group bg-zinc-900/10 border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all duration-500 shadow-2xl shadow-white/[0.02]"
    >
           {" "}
      <div className="aspect-[4/5] bg-zinc-950/50 flex items-center justify-center relative overflow-hidden">
               {" "}
        {thumbnail ? (
          <img
            src={thumbnail}
            className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-all duration-700 grayscale group-hover:grayscale-0"
          />
        ) : (
          <FileText size={24} className="text-zinc-900" />
        )}
             {" "}
      </div>
           {" "}
      <div className="p-6">
               {" "}
        <h3 className="font-serif text-lg text-zinc-300 line-clamp-1 mb-4 group-hover:text-white transition-colors">
                    {book.title}       {" "}
        </h3>
               {" "}
        <div className="flex gap-4">
                   {" "}
          <a
            href={book.url}
            target="_blank"
            className="text-zinc-600 hover:text-white transition-colors"
          >
                        <ExternalLink size={14} />         {" "}
          </a>
                   {" "}
          <a
            href={book.url}
            download
            className="text-zinc-600 hover:text-white transition-colors"
          >
                        <Download size={14} />         {" "}
          </a>
                 {" "}
        </div>
             {" "}
      </div>
         {" "}
    </motion.div>
  );
}
