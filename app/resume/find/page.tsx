"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  ExternalLink,
  FileText,
  Command,
  Trash2,
  X,
  Heart,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

interface BookResult {
  title: string;
  url: string;
}

function formatBookTitle(title: string, url: string) {
  let cleanTitle = title || "";

  // If title is just a URL or contains common storage domains
  if (
    cleanTitle.toLowerCase().includes("amazonaws.com") ||
    cleanTitle.toLowerCase().includes(".archive.org") ||
    cleanTitle.toLowerCase().includes("github.com") ||
    cleanTitle.toLowerCase().includes("edu") ||
    cleanTitle.toLowerCase().includes("gov") ||
    cleanTitle.toLowerCase().includes("http") ||
    (cleanTitle.length > 30 && !cleanTitle.includes(" "))
  ) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const parts = pathname.split("/").filter(Boolean);
      let filename = parts[parts.length - 1];

      // fallback if last part is missing or too generic
      if (!filename || filename.length < 3) {
        filename = parts[parts.length - 2] || "Document";
      }
      cleanTitle = decodeURIComponent(filename);
    } catch {
      // fallback
      cleanTitle = "Document";
    }
  }

  // Remove .pdf, dashes, underscores, and extra spaces
  cleanTitle = cleanTitle
    .replace(/\.(pdf|epub|mobi)$/i, "")
    .replace(/[-_.~]/g, " ")
    .trim();

  // Insert space before uppercase letters if they are stuck together (e.g. AtomicHabits -> Atomic Habits)
  cleanTitle = cleanTitle.replace(/([a-z])([A-Z])/g, "$1 $2");

  // Split multiple joined domains if applicable, though primarily capitalizing nicely:
  cleanTitle = cleanTitle.replace(/\b\w/g, (c) => c.toUpperCase());

  // Prevent ultra-long gibberish
  if (cleanTitle.length > 45 && !cleanTitle.includes(" ")) {
    cleanTitle = cleanTitle.substring(0, 35) + "...";
  }

  return cleanTitle || "Unknown Document";
}

export default function Dashboard() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [results, setResults] = useState<BookResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"search" | "analysis">("search");

  const [thumbnailStatus, setThumbnailStatus] = useState<
    Record<string, boolean>
  >({});

  const searchInputRef = useRef<HTMLInputElement>(null);

  const sortBooksByThumbnail = (books: BookResult[]) => {
    return [...books].sort((a, b) => {
      // true (loaded) = 1
      // false (failed) = -1
      // undefined (loading) = 0

      const getVal = (url: string) => {
        const s = thumbnailStatus[url];
        if (s === true) return 1;
        if (s === false) return -1;
        return 0; // Still loading/unknown
      };

      const aVal = getVal(a.url);
      const bVal = getVal(b.url);

      return bVal - aVal;
    });
  };

  const sortedResults = sortBooksByThumbnail(results);

  const handleBookClick = (book: BookResult) => {
    window.open(book.url, "_blank");
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    // Blur the search field so mobile keyboards close after submit.
    searchInputRef.current?.blur();

    setIsLoading(true);
    setActiveTab("search");
    setThumbnailStatus({}); // Reset thumb status on new search

    const combinedQuery = `${firstName.trim()} ${lastName.trim()}`;

    try {
      const params = new URLSearchParams({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      const res = await fetch(
        `${BACKEND_BASE_URL}/api/v1/getResumes?${params.toString()}`,
        {
          method: "GET",
        },
      );

      const data = await res.json();
      const fetchedBooks = Array.isArray(data) ? data : [];

      setResults(fetchedBooks);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!firstName.trim() || !lastName.trim()) return;

    searchInputRef.current?.blur();
    setIsAnalyzing(true);
    setActiveTab("analysis");
    setAnalysisResult(null);

    try {
      const params = new URLSearchParams({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      const res = await fetch(
        `${BACKEND_BASE_URL}/api/v1/analyzeResumes?${params.toString()}`,
        { method: "GET" },
      );
      const data = await res.json();
      setAnalysisResult(data.analysis || data);

      // Update results with the documents used
      if (data.documents && Array.isArray(data.documents)) {
        setResults(data.documents);
      }
    } catch {
      setAnalysisResult({
        error:
          "Failed to analyze resumes. The backend might have failed or timed out.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh flex-col bg-neutral-950 text-neutral-100 font-mono selection:bg-neutral-100 selection:text-neutral-900 overflow-x-hidden">
      {/* Background - Harsh Grid */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="mx-auto w-full max-w-5xl px-6 pt-32 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-16 gap-6 relative">
          <div className="bg-clay border border-neutral-600 p-6 rounded-2xl shadow-clay">
            <h1 className="text-5xl font-black uppercase tracking-tighter">
              PERSON CRAWLER
            </h1>
            <p className="text-neutral-400 font-bold uppercase tracking-widest mt-2 border-t border-neutral-700 pt-2">
              Scrap & Analyze Profiles
            </p>
          </div>
        </div>

        {/* Search */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-14 flex flex-col sm:flex-row gap-6"
        >
          <div className="relative flex-1 bg-clay border border-neutral-600 rounded-xl shadow-clay-sm focus-within:border-neutral-400 focus-within:shadow-clay-hover transition-all">
            <Search
              size={20}
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              ref={searchInputRef}
              type="text"
              placeholder="FIRST NAME"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="relative z-10 w-full bg-transparent pl-14 pr-6 py-5 text-lg font-bold uppercase placeholder:text-neutral-600 focus:outline-none"
            />
          </div>

          <div className="relative flex-1 bg-clay border border-neutral-600 rounded-xl shadow-clay-sm focus-within:border-neutral-400 focus-within:shadow-clay-hover transition-all">
            <input
              type="text"
              placeholder="LAST NAME"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="relative z-10 w-full bg-transparent px-6 pr-[150px] py-5 text-lg font-bold uppercase placeholder:text-neutral-600 focus:outline-none"
            />

            <div className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex gap-2 items-center">
              <button
                type="button"
                aria-label="Analyze Resume Profils"
                onClick={handleAnalyze}
                className="h-12 px-5 rounded-xl bg-gradient-to-b from-neutral-100 to-neutral-300 text-neutral-900 border border-neutral-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_-2px_1px_rgba(0,0,0,0.1),2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:from-neutral-50 hover:to-neutral-200 font-black uppercase tracking-wider transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={
                  isAnalyzing ||
                  isLoading ||
                  !firstName.trim() ||
                  !lastName.trim()
                }
              >
                {isAnalyzing ? (
                  <div className="animate-spin w-5 h-5 border-2 border-neutral-900/30 border-t-neutral-900 rounded-full"></div>
                ) : (
                  "Analyze"
                )}
              </button>
              <button
                type="submit"
                aria-label="Search documents"
                className="h-12 w-12 rounded-xl bg-gradient-to-b from-neutral-700 to-neutral-800 text-neutral-100 border border-neutral-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-2px_1px_rgba(0,0,0,0.3),2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:from-neutral-600 hover:to-neutral-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={
                  isLoading ||
                  isAnalyzing ||
                  !firstName.trim() ||
                  !lastName.trim()
                }
              >
                <Search size={20} />
              </button>
            </div>
          </div>
        </motion.form>

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-10 border-b border-neutral-800 pb-px">
          <button
            onClick={() => setActiveTab("search")}
            className={`pb-4 text-base font-black uppercase tracking-widest transition-colors border-b-2 relative top-px ${
              activeTab === "search"
                ? "border-neutral-100 text-neutral-100"
                : "border-transparent text-neutral-600 hover:text-neutral-400"
            }`}
          >
            DOCUMENTS {" "}
            {results.length > 0 && (
              <span className="ml-2 bg-gradient-to-b from-neutral-100 to-neutral-300 px-2 py-0.5 text-xs text-neutral-900 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                {results.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("analysis")}
            className={`pb-4 text-base font-black uppercase tracking-widest transition-colors border-b-2 relative top-px ${
              activeTab === "analysis"
                ? "border-neutral-100 text-neutral-100"
                : "border-transparent text-neutral-600 hover:text-neutral-400"
            }`}
          >
            AI REPORT
          </button>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {isLoading && activeTab === "search" ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </motion.div>
          ) : activeTab === "search" ? (
            results.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12"
              >
                {sortedResults.map((book, i) => (
                  <PDFCard
                    key={book.url}
                    book={book}
                    onClick={handleBookClick}
                    thumbnailStatus={thumbnailStatus[book.url]}
                    onPreviewStatus={(status) => {
                      setThumbnailStatus((prev) => {
                        if (prev[book.url] === status) return prev;
                        return { ...prev, [book.url]: status };
                      });
                    }}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="no-search-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-24 text-zinc-700 border-t border-neutral-800"
              >
                <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em]">
                  <div className="w-1.5 h-1.5 bg-neutral-600 rounded-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"></div>
                  <span>No Documents</span>
                </div>
              </motion.div>
            )
          ) : activeTab === "analysis" ? (
            <motion.div
              key="analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                  <div className="animate-spin w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full mb-4"></div>
                  <p>Analyzing documents with Gemini... this takes a moment.</p>
                </div>
              )}
              {!isAnalyzing && analysisResult && !analysisResult.error && (
                <div className="bg-clay border border-neutral-600 p-6 md:p-10 max-w-4xl mx-auto rounded-2xl shadow-clay-lg">
                  <h2 className="text-3xl font-black uppercase mb-6 border-b border-neutral-700 pb-4">
                    {analysisResult.name || "Unknown Profile"}
                  </h2>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-3">
                        Profile Summary
                      </h3>
                      <p className="text-neutral-300 font-bold leading-relaxed">
                        {analysisResult.summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-3">
                          Contact Info
                        </h3>
                        <ul className="space-y-3 text-neutral-300 font-bold">
                          {analysisResult.emails?.map(
                            (email: string, idx: number) => (
                              <li
                                key={`email-${idx}`}
                                className="flex items-center gap-3"
                              >
                                <div className="w-2 h-2 rounded-sm bg-gradient-to-b from-neutral-200 to-neutral-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"></div>
                                {email}
                              </li>
                            ),
                          )}
                          {analysisResult.phones?.map(
                            (phone: string, idx: number) => (
                              <li
                                key={`phone-${idx}`}
                                className="flex items-center gap-3"
                              >
                                <div className="w-2 h-2 rounded-sm bg-gradient-to-b from-neutral-200 to-neutral-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"></div>
                                {phone}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-3">
                          Web Links
                        </h3>
                        <ul className="space-y-3 text-neutral-300 font-bold break-all">
                          {analysisResult.links?.map(
                            (link: string, idx: number) => (
                              <li
                                key={`link-${idx}`}
                                className="flex items-center gap-3"
                              >
                                <ExternalLink
                                  size={16}
                                  className="text-neutral-100 shrink-0"
                                />
                                <a
                                  href={
                                    link.startsWith("http")
                                      ? link
                                      : `https://${link}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-white decoration-neutral-500 hover:decoration-neutral-100 underline-offset-4 underline transition-colors"
                                >
                                  {link}
                                </a>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>

                    {analysisResult.skills?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-4">
                          Top Skills
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {analysisResult.skills.map(
                            (skill: string, idx: number) => (
                              <span
                                key={`skill-${idx}`}
                                className="bg-clay text-neutral-100 px-4 py-2 font-black text-sm uppercase tracking-wider border border-neutral-600 rounded-lg shadow-clay-sm"
                              >
                                {skill}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {results.length > 0 && (
                    <div className="mt-14 pt-8 border-t border-neutral-700">
                      <h3 className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-6">
                        Sources Analyzed
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {results.map((book: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-gradient-to-b from-neutral-800/80 to-neutral-900/80 p-4 border border-neutral-600 rounded-xl flex items-start gap-4 cursor-pointer hover:border-neutral-400 hover:shadow-clay-hover shadow-clay-sm transition-all"
                            onClick={() => handleBookClick(book)}
                          >
                            <FileText
                              className="text-neutral-400 shrink-0 mt-0.5"
                              size={20}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-neutral-200 truncate uppercase">
                                {formatBookTitle(book.title, book.url)}
                              </p>
                              <p className="text-xs text-neutral-500 truncate mt-1">
                                {book.url}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!isAnalyzing && analysisResult?.error && (
                <div className="flex flex-col items-center py-16 text-red-400">
                  <p className="mb-2 font-medium">Analysis Failed</p>
                  <p className="text-sm opacity-80 max-w-md text-center">
                    {analysisResult.error}
                  </p>
                </div>
              )}
              {!isAnalyzing && !analysisResult && (
                <div className="flex flex-col items-center py-16 text-zinc-700 border-t border-neutral-800/50">
                  <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em]">
                    <div className="w-1.5 h-1.5 bg-neutral-600 rounded-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"></div>
                    <span>No analysis yet</span>
                  </div>
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-clay border border-neutral-600 rounded-xl overflow-hidden shadow-clay-sm">
      <Skeleton className="aspect-3/4 w-full bg-neutral-800/60" />

      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-3/4 bg-neutral-800/60" />
        <Skeleton className="h-3 w-1/2 bg-neutral-800/60" />

        <div className="flex gap-3 pt-2">
          <Skeleton className="h-5 w-5 rounded bg-neutral-800/60" />
          <Skeleton className="h-5 w-5 rounded bg-neutral-800/60" />
        </div>
      </div>
    </div>
  );
}

function PDFCard({
  book,
  onClick,
  onPreviewStatus,
  thumbnailStatus,
}: {
  book: BookResult;
  onClick: (book: BookResult) => void;
  onPreviewStatus?: (status: boolean) => void;
  thumbnailStatus?: boolean | undefined;
}) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const previewUrl = `${BACKEND_BASE_URL}/api/v1/preview?url=${encodeURIComponent(book.url)}`;

  return (
    <motion.div
      layout
      transition={{ layout: { type: "spring", stiffness: 200, damping: 25 } }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={() => onClick(book)}
      className="relative cursor-pointer group bg-clay border border-neutral-600 rounded-xl overflow-hidden hover:border-neutral-400 hover:-translate-y-1 hover:shadow-clay-hover shadow-clay-sm transition-all duration-300"
    >
      <div className="aspect-3/4 bg-gradient-to-b from-neutral-800 to-neutral-950 flex items-center justify-center overflow-hidden">
        {!previewFailed && thumbnailStatus !== false ? (
          <img
            src={previewUrl}
            alt={`Preview of ${book.title}`}
            loading="lazy"
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500"
            onLoad={() => onPreviewStatus?.(true)}
            onError={() => {
              setPreviewFailed(true);
              onPreviewStatus?.(false);
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-50">
            <FileText size={32} className="text-zinc-600" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
              No Preview
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3
          className="text-xs font-medium text-zinc-300 group-hover:text-white transition mb-3 line-clamp-1"
          title={formatBookTitle(book.title, book.url)}
        >
          {formatBookTitle(book.title, book.url)}
        </h3>

        <div className="flex items-center gap-3 text-zinc-500">
          <a
            href={book.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              onClick(book);
            }}
            className="hover:text-white transition p-1 hover:bg-zinc-800 rounded"
          >
            <ExternalLink size={14} />
          </a>

          <a
            href={book.url}
            download
            onClick={(e) => {
              e.stopPropagation();
              onClick(book);
            }}
            className="hover:text-white transition p-1 hover:bg-zinc-800 rounded"
          >
            <Download size={14} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
