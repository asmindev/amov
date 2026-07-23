# amov

Movie streaming web app built with React, TypeScript, Vite, and shadcn/ui.

## Tech Stack

- **React 19** + TypeScript (strict mode)
- **Vite** with Bun
- **shadcn/ui** (base-nova style) + Tailwind CSS v4
- **TanStack Router** (code-based routing)
- **TanStack Query** (data fetching & caching)
- **HLS.js** (adaptive streaming)
- **Zustand** (state management)
- **Lucide** (icons)

## Features

- Movie & TV series browsing (TMDB API)
- Netflix-style custom video player with HLS support
- Multi-provider video sources (Moviebox, Yoru, Neon, Cypher, Breach)
- Custom subtitle overlay with font/size/color/offset customization
- Multi-provider subtitle fetching (OpenSubtitles, Moviebox, etc.)
- Watch progress tracking (resume playback)
- Dark/light theme
- Responsive (mobile + desktop)

## Getting Started

```bash
bun install
cp .env.example .env   # add your TMDB API token
bun run dev
```

## Commands

```bash
bun run dev          # Vite dev server
bun run build        # tsc -b && vite build
bun run lint         # eslint .
bun run typecheck    # tsc -b
bun run format       # prettier --write "**/*.{ts,tsx}"
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | TMDB API base URL | `https://api.themoviedb.org/3` |
| `VITE_MOVIE_API_TOKEN` | TMDB Bearer token | — |
| `VITE_IMAGE_BASE_URL` | TMDB image CDN | `https://image.tmdb.org/t/p` |
| `VITE_DECRYPTOR_URL` | Decryptor backend URL | — |

## Project Structure

```
src/
├── api/                    # API layer (fetch, endpoints)
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── layout/             # Navbar, AppLayout
├── hooks/                  # Shared hooks
├── types/                  # Shared TypeScript types
├── helpers/                # Shared helpers
├── utils/                  # Utility functions (cn, etc.)
├── lib/                    # Config, env, query client
├── pages/
│   ├── home/               # Landing page + hero banner
│   ├── discover/           # Browse/search movies
│   ├── movie-detail/       # Movie info + player launcher
│   ├── netflix-player/     # Custom HLS video player
│   └── watchlist/          # Saved movies
├── router.tsx              # Route definitions
└── App.tsx                 # Root component
```

## Architecture

- **Page-based structure**: each page is self-contained with its own partials, hooks, and types
- **No `fetch()` outside `src/api/`**: all HTTP calls go through the API layer
- **Env vars via `src/lib/env.ts`**: validated with Zod, never `import.meta.env` directly
- **Query keys centralized** in `src/lib/query-keys.ts`

## License

Private
