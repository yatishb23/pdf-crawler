"use client"

import { Search, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface SearchFormProps {
  query: string
  setQuery: (val: string) => void
  onSearch: (e?: React.FormEvent) => void
  isLoading: boolean
}

export function SearchForm({ query, setQuery, onSearch, isLoading }: SearchFormProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="relative w-full mb-24"
    >
      <form onSubmit={onSearch} className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors">
          <Search size={22} />
        </div>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Find a document..."
          className="w-full bg-zinc-900/20 backdrop-blur-md border border-zinc-800/50 rounded-2xl pl-16 pr-32 py-6 text-xl placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 transition-all selection:bg-zinc-700"
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : "Search"}
        </button>
      </form>
    </motion.div>
  )
}