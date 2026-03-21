"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Download,
  ExternalLink,
  FileText,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Zap,
} from "lucide-react";
import type { BookResult } from "@/types/index";

let pdfjsLib: any = null;

interface PDFCardProps {
  book: BookResult;
  onSave?: (book: BookResult) => void;
  isSaved?: boolean;
}

export default function PDFCard({ book, onSave, isSaved = false }: PDFCardProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const renderAttempted = useRef(false);

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  // Get relevance badge
  const getRelevanceBadge = (score: number) => {
    if (score >= 0.8) return { label: "Highly Relevant", color: "bg-green-500/20 text-green-300" };
    if (score >= 0.6) return { label: "Relevant", color: "bg-blue-500/20 text-blue-300" };
    return { label: "Moderate", color: "bg-yellow-500/20 text-yellow-300" };
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { 
        threshold: 0.1,
        rootMargin: "50px"
      }
    );

    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Load PDF.js only when needed
    if (typeof window !== "undefined" && !pdfjsLib) {
      import("pdfjs-dist").then((pdfjs) => {
        pdfjsLib = pdfjs;
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.mjs",
          import.meta.url,
        ).toString();
      }).catch(() => {
        console.warn("PDF.js failed to load");
      });
    }
  }, []);

  useEffect(() => {
    // Prevent multiple render attempts
    if (!isVisible || thumbnail || isLoading || error || renderAttempted.current || !pdfjsLib) return;

    const renderThumbnail = async () => {
      renderAttempted.current = true;
      setIsLoading(true);
      setError(null);
      
      try {
        const proxiedUrl = `/api/v1/proxyPdf?url=${encodeURIComponent(book.url)}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const loadingTask = pdfjsLib.getDocument({
          url: proxiedUrl,
          disableStream: true,
          disableRange: true,
          disableAutoFetch: true,
          stopAtErrors: true,
        });

        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        const scale = window.innerWidth < 768 ? 0.25 : 0.35;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { 
          alpha: false,
          willReadFrequently: false 
        });

        if (!context) {
          throw new Error("Failed to get canvas context");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        setThumbnail(canvas.toDataURL("image/jpeg", 0.8));
        clearTimeout(timeoutId);
      } catch (err) {
        console.warn(`Failed to render thumbnail for ${book.title}`);
        setError("Failed to load preview");
      } finally {
        setIsLoading(false);
      }
    };

    renderThumbnail();
  }, [isVisible, book.url, book.title]);

  const relevance = getRelevanceBadge(book.relevanceScore ?? 0.5);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true, margin: "50px" }}
      className="group relative flex flex-col bg-gradient-to-b from-zinc-900/40 to-zinc-950/40 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-zinc-700/50 transition-all duration-300 hover:shadow-2xl hover:shadow-white/5"
    >
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-[3/4] bg-zinc-950 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50">
            <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 text-zinc-500">
            <FileText size={32} className="mb-2 opacity-50" />
            <span className="text-xs">{error}</span>
          </div>
        )}

        {thumbnail && (
          <img
            src={thumbnail}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}

        {!thumbnail && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
            <FileText size={48} className="text-zinc-700" />
          </div>
        )}

        {/* Source Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm border border-zinc-700/50 rounded-lg text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">
          {book.source}
        </div>

        {/* Relevance Badge */}
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 ${relevance.color} bg-opacity-20 backdrop-blur-sm border border-current/30`}>
          <Zap size={12} />
          {relevance.label}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col p-4 space-y-3">
        {/* Title */}
        <div className="flex-1">
          <h3 className="font-serif text-sm md:text-base font-bold text-white line-clamp-2 leading-tight group-hover:text-zinc-100 transition-colors">
            {book.title}
          </h3>
        </div>

        {/* Author & Year */}
        <div className="space-y-1 text-xs text-zinc-400">
          {book.author && (
            <p className="line-clamp-1">
              <span className="text-zinc-500">by</span> {book.author}
            </p>
          )}
          {book.year && (
            <p className="text-zinc-500">
              Published {book.year}
            </p>
          )}
        </div>

        {/* File Size */}
        {book.fileSize && (
          <div className="text-xs text-zinc-500">
            {formatFileSize(book.fileSize)}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 mt-auto">
          <a
            href={book.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white text-black rounded-lg font-semibold text-xs hover:bg-zinc-100 transition-colors active:scale-95"
          >
            <Download size={14} />
            Get PDF
          </a>

          {onSave && (
            <button
              onClick={() => onSave(book)}
              className={`flex items-center justify-center px-3 py-2 rounded-lg font-semibold text-xs transition-all active:scale-95 ${
                isSaved
                  ? "bg-green-500/20 text-green-300 border border-green-500/50"
                  : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              {isSaved ? (
                <BookmarkCheck size={14} />
              ) : (
                <Bookmark size={14} />
              )}
            </button>
          )}

          <a
            href={book.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-3 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors active:scale-95"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
