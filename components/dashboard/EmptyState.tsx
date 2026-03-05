import { motion } from "framer-motion"

export function EmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center py-20 text-zinc-800 border-t border-zinc-900"
    >
      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em]">
        <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
        <span>Archive Empty</span>
      </div>
    </motion.div>
  )
}