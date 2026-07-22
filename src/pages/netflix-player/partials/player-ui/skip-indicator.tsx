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
          className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-2 rounded-full bg-black/60 px-6 py-5 text-white backdrop-blur-md">
            <span className="material-symbols-outlined animate-pulse !text-[48px]">
              {skipIndicator.type === "forward" ? "forward_10" : "replay_10"}
            </span>
            <span className="text-sm font-bold tracking-wider uppercase">
              {skipIndicator.type === "forward" ? "+10s" : "-10s"}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
