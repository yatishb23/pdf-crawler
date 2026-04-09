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
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<BookResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "recent" | "favorites">(
    "search",
  );

  const [recentBooks, setRecentBooks] = useState<BookResult[]>([]);
  const [recentSearchQuery, setRecentSearchQuery] = useState("");

  const [favoriteBooks, setFavoriteBooks] = useState<BookResult[]>([]);
  const [favoriteSearchQuery, setFavoriteSearchQuery] = useState("");

  const [storageUsed, setStorageUsed] = useState<number>(0);
  const [thumbnailStatus, setThumbnailStatus] = useState<
    Record<string, boolean>
  >({});

  const searchInputRef = useRef<HTMLInputElement>(null);

  const updateStorageInfo = () => {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key) || "";
        total += key.length + value.length;
      }
    }
    setStorageUsed(total * 2); // bytes (UTF-16)
  };

  const filteredRecentBooks = recentBooks.filter((book) =>
    formatBookTitle(book.title, book.url)
      .toLowerCase()
      .includes(recentSearchQuery.toLowerCase()),
  );

  const filteredFavoriteBooks = favoriteBooks.filter((book) =>
    formatBookTitle(book.title, book.url)
      .toLowerCase()
      .includes(favoriteSearchQuery.toLowerCase()),
  );

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
  const sortedFilteredRecent = sortBooksByThumbnail(filteredRecentBooks);
  const sortedFilteredFavorites = sortBooksByThumbnail(filteredFavoriteBooks);

  useEffect(() => {
    const savedRecent = localStorage.getItem("recentBooks");
    if (savedRecent) {
      try {
        const parsed = JSON.parse(savedRecent);
        setRecentBooks(parsed);
        if (parsed.length > 0 && !searchQuery) {
          setActiveTab("recent");
        }
      } catch {}
    }

    const savedFavs = localStorage.getItem("favoriteBooks");
    if (savedFavs) {
      try {
        const parsed = JSON.parse(savedFavs);
        setFavoriteBooks(parsed);
      } catch {}
    }

    updateStorageInfo();
  }, []);

  const toggleFavorite = (book: BookResult) => {
    setFavoriteBooks((prev) => {
      const isFav = prev.some((b) => b.url === book.url);
      let newFav;
      if (isFav) {
        newFav = prev.filter((b) => b.url !== book.url);
        if (newFav.length === 0 && activeTab === "favorites") {
          setActiveTab("search");
        }
      } else {
        newFav = [book, ...prev];
      }
      localStorage.setItem("favoriteBooks", JSON.stringify(newFav));
      // Small timeout to allow localStorage to update
      setTimeout(updateStorageInfo, 0);
      return newFav;
    });
  };

  const handleBookClick = (book: BookResult) => {
    setRecentBooks((prev) => {
      const filtered = prev.filter((b) => b.url !== book.url);
      const newRecent = [book, ...filtered].slice(0, 50);
      localStorage.setItem("recentBooks", JSON.stringify(newRecent));
      setTimeout(updateStorageInfo, 0);
      return newRecent;
    });
    window.open(book.url, "_blank");
  };

  const handleRemoveRecentBook = (book: BookResult) => {
    setRecentBooks((prev) => {
      const filtered = prev.filter((b) => b.url !== book.url);
      localStorage.setItem("recentBooks", JSON.stringify(filtered));
      if (filtered.length === 0) {
        setActiveTab("search"); // switch back if empty
      }
      setTimeout(updateStorageInfo, 0);
      return filtered;
    });
  };

  const clearAllRecentBooks = () => {
    setRecentBooks([]);
    localStorage.removeItem("recentBooks");
    setActiveTab("search");
    setTimeout(updateStorageInfo, 0);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    // Blur the search field so mobile keyboards close after submit.
    searchInputRef.current?.blur();

    setIsLoading(true);
    setActiveTab("search");
    setThumbnailStatus({}); // Reset thumb status on new search

    try {
      const res = await fetch(
        `${BACKEND_BASE_URL}/api/v1/getBooks?q=${encodeURIComponent(searchQuery)}`,
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

  return (
    <main className="relative flex min-h-dvh flex-col bg-zinc-950 text-zinc-100 selection:bg-white selection:text-black overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.05),transparent_60%)]" />

      <div className="mx-auto w-full max-w-5xl px-6 pt-28 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-16 gap-6">
          <div>
            <h1 className="text-4xl font-serif tracking-tight">
              Library<span className="text-zinc-500">.</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Search and manage your PDF documents
            </p>
          </div>

          <div className="flex flex-col sm:items-end text-left sm:text-right bg-zinc-900/30 p-3 rounded-xl border border-zinc-800/50">
            <div className="text-xs text-zinc-500 mb-2 font-medium">
              Local Storage Used
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-300 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((storageUsed / 5242880) * 100, 100)}%`,
                  }}
                />
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {(storageUsed / 1024).toFixed(1)}{" "}
                <span className="text-[10px] text-zinc-500">/ 5120 KB</span>
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-10"
        >
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-300 focus-within:border-zinc-600/80 focus-within:shadow-[0_16px_40px_rgba(0,0,0,0.55)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(255,255,255,0.08),transparent_45%)]" />

            <Search
              size={18}
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-zinc-300"
            />

            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative z-10 w-full bg-transparent pl-14 pr-16 py-4 md:py-5 text-sm md:text-base text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
            />

            <button
              type="submit"
              aria-label="Search documents"
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 h-11 w-11 rounded-xl bg-white text-black hover:bg-zinc-200 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isLoading || !searchQuery.trim()}
            >
              <Search size={18} />
            </button>
          </div>

          <div className="mt-3 hidden sm:flex items-center justify-end gap-1 text-xs text-zinc-500">
            <Command size={12} />
            <span>Press Enter to search</span>
          </div>
        </motion.form>

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-8 border-b border-zinc-800/60 pb-px">
          <button
            onClick={() => setActiveTab("search")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 relative top-px ${
              activeTab === "search"
                ? "border-white text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Search Results{" "}
            {results.length > 0 && (
              <span className="ml-1.5 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-white">
                {results.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("recent")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 relative top-px ${
              activeTab === "recent"
                ? "border-white text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Recent{" "}
            {recentBooks.length > 0 && (
              <span className="ml-1.5 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-white">
                {recentBooks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 relative top-px ${
              activeTab === "favorites"
                ? "border-white text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Favorites{" "}
            {favoriteBooks.length > 0 && (
              <span className="ml-1.5 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-white">
                {favoriteBooks.length}
              </span>
            )}
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
                    isFavorite={favoriteBooks.some((b) => b.url === book.url)}
                    onToggleFavorite={() => toggleFavorite(book)}
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
                className="flex flex-col items-center py-24 text-zinc-700 border-t border-zinc-900"
              >
                <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em]">
                  <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
                  <span>No Documents</span>
                </div>
              </motion.div>
            )
          ) : activeTab === "favorites" ? (
            favoriteBooks.length > 0 ? (
              <motion.div
                key="favorites"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="relative max-w-md">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    type="text"
                    placeholder="Filter favorite books..."
                    value={favoriteSearchQuery}
                    onChange={(e) => setFavoriteSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900/30 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>

                {sortedFilteredFavorites.length > 0 ? (
                  <motion.div
                    layout
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12"
                  >
                    <AnimatePresence>
                      {sortedFilteredFavorites.map((book, i) => (
                        <PDFCard
                          key={book.url}
                          book={book}
                          onClick={handleBookClick}
                          isFavorite={true}
                          onToggleFavorite={() => toggleFavorite(book)}
                          thumbnailStatus={thumbnailStatus[book.url]}
                          onPreviewStatus={(status) => {
                            setThumbnailStatus((prev) => {
                              if (prev[book.url] === status) return prev;
                              return { ...prev, [book.url]: status };
                            });
                          }}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center py-16 text-zinc-700 border-t border-zinc-900/50">
                    <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em]">
                      <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
                      <span>No matches found</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="no-favorite-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-24 text-zinc-700 border-t border-zinc-900"
              >
                <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em]">
                  <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
                  <span>No Favorite Books</span>
                </div>
              </motion.div>
            )
          ) : recentBooks.length > 0 ? (
            <motion.div
              key="recent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between gap-4 max-w-md">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    type="text"
                    placeholder="Filter recent books..."
                    value={recentSearchQuery}
                    onChange={(e) => setRecentSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900/30 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
                <button
                  onClick={clearAllRecentBooks}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 rounded-xl transition-colors"
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
              </div>

              {sortedFilteredRecent.length > 0 ? (
                <motion.div
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12"
                >
                  <AnimatePresence>
                    {sortedFilteredRecent.map((book, i) => (
                      <PDFCard
                        key={book.url}
                        book={book}
                        onClick={handleBookClick}
                        onRemove={() => handleRemoveRecentBook(book)}
                        isFavorite={favoriteBooks.some(
                          (b) => b.url === book.url,
                        )}
                        onToggleFavorite={() => toggleFavorite(book)}
                        thumbnailStatus={thumbnailStatus[book.url]}
                        onPreviewStatus={(status) => {
                          setThumbnailStatus((prev) => {
                            if (prev[book.url] === status) return prev;
                            return { ...prev, [book.url]: status };
                          });
                        }}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center py-16 text-zinc-700 border-t border-zinc-900/50">
                  <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em]">
                    <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
                    <span>No matches found</span>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="no-recent-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-24 text-zinc-700 border-t border-zinc-900"
            >
              <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em]">
                <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
                <span>No Recent Books</span>
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

function PDFCard({
  book,
  onClick,
  onRemove,
  isFavorite,
  onToggleFavorite,
  onPreviewStatus,
  thumbnailStatus,
}: {
  book: BookResult;
  onClick: (book: BookResult) => void;
  onRemove?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
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
      className="relative cursor-pointer group bg-zinc-900/40 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300"
    >
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-2 left-2 z-10 p-1.5 bg-black/60 backdrop-blur-md rounded-md text-zinc-400 hover:text-pink-500 hover:bg-black/80 transition-colors"
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            size={14}
            className={isFavorite ? "fill-pink-500 text-pink-500" : ""}
          />
        </button>
      )}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 right-2 z-10 p-1.5 bg-black/60 backdrop-blur-md rounded-md text-zinc-400 hover:text-red-400 hover:bg-black/80 transition-colors"
          title="Remove from recents"
        >
          <X size={14} />
        </button>
      )}
      <div className="aspect-3/4 bg-zinc-900 flex items-center justify-center overflow-hidden">
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
