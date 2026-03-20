"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, ExternalLink, FileText, Command } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:8000";

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
        `${BACKEND_BASE_URL}/api/v1/getBooks?q=${encodeURIComponent(searchQuery)}`,
      );

      const data = await res.json();

      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh flex-col bg-zinc-950 text-zinc-100 selection:bg-white selection:text-black overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.05),transparent_60%)]" />

      <div className="mx-auto w-full max-w-5xl px-6 pt-28 pb-20">
        {/* Header */}
        <div className="flex items-end justify-between mb-16">
          <div>
            <h1 className="text-4xl font-serif tracking-tight">
              Library<span className="text-zinc-500">.</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Search and manage your PDF documents
            </p>
          </div>
        </div>

        {/* Search */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative group mb-20"
        >
          <Search
            size={20}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition"
          />

          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/40 border border-zinc-800 px-14 py-4 rounded-xl text-sm focus:outline-none focus:border-zinc-600 transition placeholder:text-zinc-600 backdrop-blur-xl"
          />

          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-xs text-zinc-500">
            <Command size={12} />K
          </div>
        </motion.form>

        {/* Results */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="
    grid
    grid-cols-2
    sm:grid-cols-3
    lg:grid-cols-4
    gap-x-8
    gap-y-12
  "
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="
    grid
    grid-cols-2
    sm:grid-cols-3
    lg:grid-cols-4
    gap-x-8
    gap-y-12
  "
            >
              {results.map((book, i) => (
                <PDFCard key={i} book={book} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-24 text-zinc-700 border-t border-zinc-900"
            >
              <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em]">
                <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
                <span>No Documents</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg overflow-hidden">
      <Skeleton className="aspect-3/4 w-full bg-zinc-800" />

      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-3/4 bg-zinc-800" />
        <Skeleton className="h-3 w-1/2 bg-zinc-800" />

        <div className="flex gap-3 pt-2">
          <Skeleton className="h-5 w-5 rounded bg-zinc-800" />
          <Skeleton className="h-5 w-5 rounded bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}

function PDFCard({ book }: { book: BookResult }) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const previewUrl = `${BACKEND_BASE_URL}/api/v1/preview?url=${encodeURIComponent(book.url)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-zinc-900/40 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="aspect-3/4 bg-zinc-900 flex items-center justify-center overflow-hidden">
        {!previewFailed ? (
          <img
            src={previewUrl}
            alt={`Preview of ${book.title}`}
            loading="lazy"
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500"
            onError={() => setPreviewFailed(true)}
          />
        ) : (
          <FileText size={24} className="text-zinc-700" />
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xs font-medium text-zinc-300 group-hover:text-white transition mb-3 line-clamp-1">
          {book.title}
        </h3>

        <div className="flex items-center gap-3 text-zinc-500">
          <a
            href={book.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            <ExternalLink size={14} />
          </a>

          <a href={book.url} download className="hover:text-white transition">
            <Download size={14} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
