"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { FileText, ExternalLink, Download } from "lucide-react"

// Assume pdfjsLib is initialized in a separate utility or handled globally
declare const pdfjsLib: any

export function PDFCard({ title, url }: { title: string; url: string }) {
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.1 })
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible || thumbnail || !pdfjsLib) return
    const render = async () => {
      try {
        const proxiedUrl = `/api/v1/proxyPdf?url=${encodeURIComponent(url)}`
        const loadingTask = pdfjsLib.getDocument({ url: proxiedUrl, disableStream: true, disableRange: true })
        const pdf = await loadingTask.promise
        const page = await pdf.getPage(1)
        const viewport = page.getViewport({ scale: 0.3 })
        const canvas = document.createElement("canvas")
        canvas.height = viewport.height
        canvas.width = viewport.width
        await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise
        setThumbnail(canvas.toDataURL())
      } catch (e) {
        console.error("PDF Thumb failed", e)
      }
    }
    render()
  }, [isVisible, url, thumbnail])

  return (
    <motion.div
      ref={containerRef}
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="group bg-zinc-900/10 border border-zinc-900 rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-500 shadow-2xl shadow-white/[0.02]"
    >
      <div className="aspect-[3/4] bg-zinc-950/50 flex items-center justify-center relative overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 grayscale group-hover:grayscale-0" />
        ) : (
          <FileText size={20} className="text-zinc-800" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-serif text-sm text-zinc-400 line-clamp-1 mb-3 group-hover:text-zinc-200 transition-colors">
          {title}
        </h3>
        <div className="flex gap-3">
          <a href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-lg transition-all" title="View PDF">
            <ExternalLink size={14} />
          </a>
          <a href={url} download className="p-1.5 text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-lg transition-all" title="Download PDF">
            <Download size={14} />
          </a>
        </div>
      </div>
    </motion.div>
  )
}