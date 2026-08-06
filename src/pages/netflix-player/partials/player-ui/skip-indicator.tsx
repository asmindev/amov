import { motion, AnimatePresence } from "motion/react"

interface SkipIndicatorProps {
  skipIndicator: {
    type: "forward" | "backward"
    id: number
  } | null
}

export function SkipIndicator({ skipIndicator }: SkipIndicatorProps) {
  return (
    <AnimatePresence>
      {skipIndicator && (
        <motion.div
          key={skipIndicator.id}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`pointer-events-none absolute inset-0 z-50 flex items-center justify-center ${
            skipIndicator.type === "forward"
              ? "md:justify-end md:pr-32"
              : "md:justify-start md:pl-32"
          }`}
        >
          <div className="flex flex-col items-center gap-2 rounded-full px-6 py-5 text-white backdrop-blur-xs border border-white/20 bg-black/10">
            <span className="text-sm font-bold tracking-wider uppercase">
              {skipIndicator.type === "forward" ? "+10 s" : "-10 s"}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
