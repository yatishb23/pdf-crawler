"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Download,
  ExternalLink,
  FileText,
  Loader2,
} from "lucide-react";

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

// 2 = has thumbnail (top), 1 = still loading (middle), 0 = failed (bottom)
const weight = (status: true | false | undefined) =>
  status === true ? 2 : status === false ? 0 : 1;

export default function Dashboard() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [results, setResults] = useState<BookResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailStatus, setThumbnailStatus] = useState<
    Record<string, true | false>
  >({});

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    const combinedQuery = `${firstName.trim()} ${lastName.trim()}`;

    setIsLoading(true);
    setThumbnailStatus({});
    try {
      const params = new URLSearchParams({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      const res = await fetch(`/api/v1/getResumes?${params.toString()}`, {
        method: "GET",
      });
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Recompute sort every time thumbnailStatus changes
  const sortedResults = useMemo(() => {
    return [...results].sort(
      (a, b) => weight(thumbnailStatus[b.url]) - weight(thumbnailStatus[a.url]),
    );
  }, [results, thumbnailStatus]);

  const handleThumbnailComplete = (url: string, success: boolean) => {
    setThumbnailStatus((prev) => {
      // Only update if value actually changed — avoids unnecessary re-renders
      if (prev[url] === success) return prev;
      return { ...prev, [url]: success as true | false };
    });
  };

  return (
    <main className="relative flex min-h-dvh flex-col bg-black text-white selection:bg-white selection:text-black overflow-x-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-200 w-full [background:radial-gradient(circle_at_50%_-10%,#18181b_0%,transparent_70%)] opacity-50" />

      <div className="mx-auto w-full max-w-5xl px-6 pt-32 pb-20">
        <header className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-serif text-6xl md:text-7xl tracking-tight leading-none mb-6">
              Resumes
              <span className="opacity-70 text-zinc-400">.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 mb-8 max-w-lg leading-relaxed mix-blend-plus-lighter italic">
              Find anyone's curriculum vitae.
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="group inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-2xl font-bold text-base hover:bg-zinc-200 transition-all duration-500 shadow-2xl shadow-white/5"
          >
            <Plus size={18} strokeWidth={3} />
            Upload PDF
          </motion.button>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative w-full mb-24"
        >
          <form
            onSubmit={handleSearch}
            className="relative flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-1 group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors">
                <Search size={22} />
              </div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name (e.g. Yatish)"
                className="w-full bg-zinc-900/20 backdrop-blur-md border border-zinc-800/50 rounded-2xl pl-16 pr-6 py-6 text-xl placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 transition-all selection:bg-zinc-700"
              />
            </div>

            <div className="relative flex-1 group">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Surname (e.g. Badgujar)"
                className="w-full bg-zinc-900/20 backdrop-blur-md border border-zinc-800/50 rounded-2xl px-6 sm:pr-32 py-6 text-xl placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 transition-all selection:bg-zinc-700"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hidden sm:block"
              >
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Search"
                )}
              </button>
            </div>

            <button
              type="submit"
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all sm:hidden w-full"
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin mx-auto" />
              ) : (
                "Search"
              )}
            </button>
          </form>
        </motion.div>

        <AnimatePresence mode="wait">
          {results.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-8"
            >
              <AnimatePresence>
                {sortedResults.map((book) => (
                  // Key includes weight so React re-renders card in correct position when status changes
                  <motion.div
                    key={`${book.url}-${weight(thumbnailStatus[book.url])}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                  >
                    <PDFCard
                      book={book}
                      onThumbnailComplete={(success) =>
                        handleThumbnailComplete(book.url, success)
                      }
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            !isLoading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col items-center py-20 text-zinc-800 border-t border-zinc-900"
              >
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em]">
                  <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full"></div>
                  <span>Archive Empty</span>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function PDFCard({
  book,
  onThumbnailComplete,
}: {
  book: BookResult;
  onThumbnailComplete?: (success: boolean) => void;
}) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [renderFailed, setRenderFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  // Ensure we only fire onThumbnailComplete once per card
  const reportedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || thumbnail || renderFailed || !pdfjsLib) return;

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
        await page.render({
          canvasContext: canvas.getContext("2d")!,
          viewport,
        }).promise;
        const dataUrl = canvas.toDataURL();
        setThumbnail(dataUrl);
        if (!reportedRef.current) {
          reportedRef.current = true;
          onThumbnailComplete?.(true);
        }
      } catch {
        setRenderFailed(true);
        if (!reportedRef.current) {
          reportedRef.current = true;
          onThumbnailComplete?.(false);
        }
      }
    };

    render();
  }, [isVisible, book.url, thumbnail, renderFailed]);

  const isLoadingThumbnail = isVisible && !thumbnail && !renderFailed;

  return (
    <div
      ref={containerRef}
      className="group bg-zinc-900/10 border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all duration-500 shadow-2xl shadow-white/2"
    >
      <div className="aspect-4/5 bg-zinc-950/50 flex items-center justify-center relative overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-all duration-700 grayscale group-hover:grayscale-0"
          />
        ) : isLoadingThumbnail ? (
          <div className="w-full h-full animate-pulse bg-zinc-900/60" />
        ) : (
          <FileText size={24} className="text-zinc-900" />
        )}
      </div>

      <div className="p-6">
        <h3 className="font-serif text-lg text-zinc-300 line-clamp-1 mb-4 group-hover:text-white transition-colors">
          {book.title}
        </h3>
        <div className="flex gap-4">
          <a
            href={book.url}
            target="_blank"
            className="text-zinc-600 hover:text-white transition-colors"
          >
            <ExternalLink size={14} />
          </a>
          <a
            href={book.url}
            download
            className="text-zinc-600 hover:text-white transition-colors"
          >
            <Download size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
