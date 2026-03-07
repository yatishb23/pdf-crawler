"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Download,
  ExternalLink,
  FileText,
  FileX,
  AlertCircle,
} from "lucide-react";

let pdfjsLib: any = null;

interface BookResult {
  title: string;
  url: string;
}

export default function PDFCard({ book }: { book: BookResult }) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const renderAttempted = useRef(false);

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
        // Silently fail if PDF.js fails to load
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
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        // Load PDF with better mobile settings
        const loadingTask = pdfjsLib.getDocument({
          url: proxiedUrl,
          disableStream: true,
          disableRange: true,
          disableAutoFetch: true,
          stopAtErrors: true,
        });

        const pdf = await loadingTask.promise;
        
        // Get the first page
        const page = await pdf.getPage(1);
        
        // Smaller scale for mobile
        const scale = window.innerWidth < 768 ? 0.25 : 0.35;
        const viewport = page.getViewport({ scale });

        // Create canvas with optimal size for mobile
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { 
          alpha: false,
          willReadFrequently: false 
        });

        if (!context) {
          throw new Error("Could not get canvas context");
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Clear the canvas with dark background
        context.fillStyle = "#18181b";
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Render the page
        await page.render({
          canvasContext: context,
          viewport,
          background: "#18181b",
        }).promise;

        // Compress the image for mobile
        const compressedImage = canvas.toDataURL("image/jpeg", 0.7);
        setThumbnail(compressedImage);
        
        clearTimeout(timeoutId);
        
        // Cleanup
        pdf.destroy();
        canvas.remove();
      } catch (err: any) {
        // Handle different error types gracefully
        console.warn("Failed to render PDF thumbnail:", err?.message || "Unknown error");
        
        // Set appropriate error message based on status code if available
        if (err?.message?.includes("410")) {
          setError("gone");
        } else if (err?.name === "AbortError" || err?.message?.includes("timeout")) {
          setError("timeout");
        } else {
          setError("generic");
        }
      } finally {
        setIsLoading(false);
      }
    };

    renderThumbnail();
  }, [isVisible, book.url, thumbnail, isLoading, error]);

  // Render default preview based on error type or loading state
  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-4">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin mb-2" />
          <span className="text-[10px] text-zinc-600">Loading...</span>
        </div>
      );
    }

    if (thumbnail) {
      return (
        <img
          src={thumbnail}
          alt={`Thumbnail for ${book.title}`}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500"
          loading="lazy"
          onError={() => setError("generic")}
        />
      );
    }

    // Default preview for all error cases
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center h-full">
        {error === "gone" ? (
          <>
            <FileX size={28} className="text-zinc-700 mb-2" />
            <span className="text-[10px] text-zinc-600">PDF no longer available</span>
          </>
        ) : error === "timeout" ? (
          <>
            <AlertCircle size={28} className="text-zinc-700 mb-2" />
            <span className="text-[10px] text-zinc-600">Loading timeout</span>
          </>
        ) : (
          <>
            <FileText size={28} className="text-zinc-700 mb-2" />
            <span className="text-[10px] text-zinc-600">Preview unavailable</span>
          </>
        )}
        <span className="text-[8px] text-zinc-700 mt-1 truncate max-w-full px-2">
          {book.title}
        </span>
      </div>
    );
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-zinc-900/40 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="aspect-3/4 bg-zinc-900 flex items-center justify-center overflow-hidden relative min-h-35">
        {renderPreview()}
      </div>

      <div className="p-3">
        <h3 className="text-xs font-medium text-zinc-300 group-hover:text-white transition mb-3 line-clamp-1">
          {book.title}
        </h3>

        <div className="flex items-center gap-3 text-zinc-500">
          <a
            href={book.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition p-1 hover:bg-zinc-800 rounded"
            aria-label="Open PDF in new tab"
            onClick={(e) => {
              // If we know the PDF is gone, prevent opening
              if (error === "gone") {
                e.preventDefault();
                alert("This PDF is no longer available");
              }
            }}
          >
            <ExternalLink size={14} />
          </a>

          <a 
            href={book.url} 
            download 
            className="hover:text-white transition p-1 hover:bg-zinc-800 rounded"
            aria-label="Download PDF"
            onClick={(e) => {
              // If we know the PDF is gone, prevent downloading
              if (error === "gone") {
                e.preventDefault();
                alert("This PDF is no longer available");
              }
            }}
          >
            <Download size={14} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}