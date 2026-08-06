import { motion } from "motion/react"

export function MoviePendingSkeleton() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="w-80 max-w-[80vw] space-y-6">
        {/* Poster skeleton */}
        <div className="mx-auto aspect-[2/3] w-56 overflow-hidden rounded-none bg-white/5">
          <div className="h-full w-full animate-shimmer bg-[length:200%_100%] bg-linear-to-r from-white/5 via-white/10 to-white/5" />
        </div>

        {/* Title skeleton */}
        <div className="mx-auto h-4 w-48 overflow-hidden rounded bg-white/5">
          <div className="h-full w-full animate-shimmer bg-[length:200%_100%] bg-linear-to-r from-white/5 via-white/15 to-white/5" />
        </div>

        {/* Provider skeleton */}
        <div className="mx-auto h-3 w-32 overflow-hidden rounded bg-white/5">
          <div className="h-full w-full animate-shimmer bg-[length:200%_100%] bg-linear-to-r from-white/5 via-white/10 to-white/5" />
        </div>
      </div>
    </div>
  )
}

export function SourceLoadingOverlay({
  posterUrl,
  title,
  provider,
}: {
  posterUrl?: string
  title: string
  provider: string
}) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black">
      {posterUrl && (
        <img
          src={posterUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />

      <div className="relative z-10 w-80 max-w-[80vw] space-y-6 text-center">
        {/* Shimmer bar */}
        <div className="mx-auto h-1 w-48 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-white/40"
            animate={{ x: ["-100%", "400%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        </div>

        {/* Title */}
        <motion.h1
          className="text-lg font-bold text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h1>

        {/* Connecting text with animated dots */}
        <div className="flex items-center justify-center gap-1 text-sm text-white/50">
          <span>Connecting via</span>
          <span className="font-semibold text-red-400">{provider}</span>
          <span className="flex w-6 gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="inline-block h-1 w-1 rounded-full bg-white/50"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  )
}

export function ProviderConnectingOverlay({
  provider,
  providerIndex,
  allProviders,
}: {
  provider: string
  providerIndex: number
  allProviders: readonly string[]
}) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60">
      {/* Shimmer bar */}
      <div className="mb-6 h-1 w-48 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-white/40"
          animate={{ x: ["-100%", "400%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
      </div>

      <p className="text-base font-medium text-white/80">
        Connecting via{" "}
        <span className="font-bold text-[#E50914]">{provider}</span>
        <span className="ml-1 inline-flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="inline-block h-1 w-1 rounded-full bg-white/60"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          ))}
        </span>
      </p>

      {providerIndex > 0 && (
        <p className="mt-1 text-sm text-white/40">
          Fallback {providerIndex + 1} / {allProviders.length}
        </p>
      )}
    </div>
  )
}

export function BufferingPulse() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/10 transition-all duration-500">
      <div className="relative flex h-28 w-28 items-center justify-center">
        
        {/* Outer glowing dust/nebula */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20 blur-[20px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />

        {/* Counter-rotating accretion disk */}
        <motion.div
          className="absolute inset-1 rounded-full border-[1.5px] border-dashed border-primary/30"
          animate={{ rotate: -360, scale: [1, 1.05, 1] }}
          transition={{ 
            rotate: { repeat: Infinity, duration: 12, ease: "linear" }, 
            scale: { repeat: Infinity, duration: 4, ease: "easeInOut" } 
          }}
        />

        {/* Main sweeping energy ring */}
        <motion.div
          className="absolute inset-3 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent 40%, var(--primary) 100%)",
            maskImage: "radial-gradient(transparent 60%, black 61%)",
            WebkitMaskImage: "radial-gradient(transparent 60%, black 61%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
        />

        {/* Secondary sweeping energy ring (faster, offset, white-hot) */}
        <motion.div
          className="absolute inset-4 rounded-full"
          style={{
            background: "conic-gradient(from 180deg, transparent 60%, #ffffff 100%)",
            maskImage: "radial-gradient(transparent 62%, black 63%)",
            WebkitMaskImage: "radial-gradient(transparent 62%, black 63%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
        />

        {/* Inner black hole core */}
        <div 
          className="absolute inset-5 rounded-full bg-black z-10" 
          style={{ boxShadow: "inset 0 0 20px #000, 0 0 20px var(--primary)" }}
        />
        
        {/* Event Horizon edge pulsing */}
        <motion.div
          className="absolute inset-5 rounded-full border border-primary z-20"
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />
        
      </div>
    </div>
  )
}
