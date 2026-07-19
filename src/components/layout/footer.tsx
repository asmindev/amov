import { getImageUrl } from "@/helpers/image-url"

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/50">
      <div className="mx-auto w-full max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center gap-6">
          <img
            src={getImageUrl(null)}
            alt="AMOV"
            className="h-8 w-auto opacity-50"
          />
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>Data provided by TMDB</span>
            <span className="text-border">|</span>
            <span>Built with React + Vite</span>
          </div>
          <p className="text-center text-xs text-muted-foreground/60">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              TMDB
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
        <div className="mt-8 text-center text-[10px] text-muted-foreground/40">
          &copy; {new Date().getFullYear()} AMOV. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
