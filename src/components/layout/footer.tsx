import { useState, useEffect } from "react"
import { Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import {
  ArrowUpRight,
  Globe2,
  Film,
  Tv,
  Bookmark,
  Sparkles,
  ArrowUp,
} from "lucide-react"

export function Footer() {
  const [time, setTime] = useState<string>("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZoneName: "short",
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative z-10 overflow-hidden border-t border-white/10 bg-black text-white selection:bg-primary selection:text-white">
      {/* Background Ambient Glow Effects */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-[300px] w-[500px] rounded-full bg-red-600/5 blur-[120px]" />

      <div className="relative mx-auto max-w-[1400px] px-6 pt-20 pb-12 md:px-16">
        {/* Top Header Bar with Live Indicator & Action */}
        <div className="mb-20 flex flex-col justify-between gap-8 border-b border-white/10 pb-12 md:flex-row md:items-end">
          <div className="space-y-6">
            {/* Surprise Element: Interactive Cinematic Infinite Ticker & Visualizer */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                {/* Animated Equalizer Soundwave */}
                <div className="flex h-5 items-end gap-1">
                  <span className="h-full w-1 animate-[bounce_1s_infinite_100ms] rounded-full bg-primary" />
                  <span className="h-3/4 w-1 animate-[bounce_1s_infinite_300ms] rounded-full bg-red-500" />
                  <span className="h-full w-1 animate-[bounce_1s_infinite_200ms] rounded-full bg-white" />
                  <span className="h-1/2 w-1 animate-[bounce_1s_infinite_400ms] rounded-full bg-primary" />
                </div>
                <span className="font-mono text-xs font-semibold tracking-widest text-primary uppercase">
                  Cinematic Soundscape Active
                </span>
                <span className="font-mono text-xs text-white/30">•</span>
                <span className="font-mono text-xs text-white/50">{time}</span>
              </div>

              {/* Kinetic Infinite Marquee Bar */}
              <div className="relative flex w-full max-w-2xl overflow-hidden rounded-none border border-white/10 bg-white/[0.03] py-2.5 backdrop-blur-md">
                <div className="animate-marquee flex shrink-0 whitespace-nowrap text-xs font-mono tracking-widest text-white/70 uppercase">
                  <span className="mx-4 text-primary">★ NEXT-GEN STREAMING</span>
                  <span className="mx-4">4K ULTRA HD CONTENT</span>
                  <span className="mx-4 text-primary">★ UNLIMITED MOVIES & SHOWS</span>
                  <span className="mx-4">TMDB METADATA POWERED</span>
                </div>
                <div className="animate-marquee flex shrink-0 whitespace-nowrap text-xs font-mono tracking-widest text-white/70 uppercase" aria-hidden="true">
                  <span className="mx-4 text-primary">★ NEXT-GEN STREAMING</span>
                  <span className="mx-4">4K ULTRA HD CONTENT</span>
                  <span className="mx-4 text-primary">★ UNLIMITED MOVIES & SHOWS</span>
                  <span className="mx-4">TMDB METADATA POWERED</span>
                </div>
              </div>
            </div>

            <h3 className="max-w-2xl font-heading text-4xl font-black tracking-tight text-white md:text-6xl">
              Elevating the <span className="bg-gradient-to-r from-red-500 via-primary to-rose-400 bg-clip-text text-transparent">Cinematic Experience.</span>
            </h3>
          </div>

          <button
            onClick={scrollToTop}
            className="group flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-all duration-300 hover:scale-110 hover:border-white hover:bg-white hover:text-black active:scale-95"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-1" />
          </button>
        </div>

        {/* Navigation & Info Grid */}
        <div className="mb-24 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Platform links */}
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-widest text-white/40 uppercase">
              Explore
            </p>
            <ul className="space-y-3 font-medium text-sm">
              <li>
                <Link
                  to="/"
                  className="group inline-flex items-center gap-2 text-white/70 transition-colors hover:text-primary"
                >
                  <Film className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                  <span>Featured Movies</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/discover"
                  search={{ type: "tv" }}
                  className="group inline-flex items-center gap-2 text-white/70 transition-colors hover:text-primary"
                >
                  <Tv className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                  <span>TV Series</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/watchlist"
                  className="group inline-flex items-center gap-2 text-white/70 transition-colors hover:text-primary"
                >
                  <Bookmark className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                  <span>Saved Watchlist</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Data Sources */}
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-widest text-white/40 uppercase">
              Data & API
            </p>
            <ul className="space-y-3 font-medium text-sm">
              <li>
                <a
                  href="https://www.themoviedb.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 text-white/70 transition-colors hover:text-white"
                >
                  <span>The Movie Database (TMDB)</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-50 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="https://player.videasy.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 text-white/70 transition-colors hover:text-white"
                >
                  <span>Videasy Network</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-50 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Technology Stack */}
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-widest text-white/40 uppercase">
              Architecture
            </p>
            <div className="flex flex-wrap gap-2">
              {["React 19", "Vite", "TanStack Router", "Tailwind CSS", "TypeScript", "Zod", "Framer Motion"].map(
                (tech) => (
                  <span
                    key={tech}
                    className="rounded-none border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-white/80"
                  >
                    {tech}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Col 4: Disclaimer Card */}
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-widest text-white/40 uppercase">
              Attribution
            </p>
            <div className="relative overflow-hidden rounded-none border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold tracking-wider text-white uppercase">
                  TMDB API Notice
                </span>
              </div>
              <p className="text-xs leading-relaxed text-white/60">
                This platform utilizes the TMDB API for media information and metadata but is not endorsed or certified by TMDB.
              </p>
            </div>
          </div>
        </div>

        {/* Massive Dynamic Awwwards Typography */}
        <div className="relative my-8 overflow-hidden select-none">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center font-heading text-[15vw] font-black leading-none tracking-tighter text-transparent bg-gradient-to-b from-white/20 via-white/10 to-transparent bg-clip-text"
          >
            AMOV
          </motion.h1>
        </div>

        {/* Bottom Copyright & Status Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/40 sm:flex-row">
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4" />
            <span>&copy; {new Date().getFullYear()} AMOV Studio. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span className="hover:text-white/80 transition-colors">DESIGNED FOR CINEMAPHILES</span>
            <span>•</span>
            <span className="text-primary font-bold">V2.4 ULTRA</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
