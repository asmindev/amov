# AGENTS.md

## Project

React + TypeScript + Vite + shadcn/ui (base-nova style). Package manager is **bun**.

## Commands

```bash
bun run dev          # Vite dev server
bun run build        # tsc -b && vite build
bun run lint         # eslint .
bun run typecheck    # tsc -b
bun run format       # prettier --write "**/*.{ts,tsx}"
bun run preview      # vite preview
bunx shadcn@latest add <component>  # add shadcn/ui component (use bunx, not npx)
```

No test framework is configured. `build` runs `tsc -b` before vite build.

## Conventions

- **No semicolons, double quotes, trailing commas** (ES5). Prettier enforces this.
- **Tailwind classes**: sorted by `prettier-plugin-tailwindcss` (configured for `cn`/`cva` functions).
- **Naming**: folders and files use kebab-case (e.g. `movie-detail/`, `hero-banner.tsx`, `use-trending-movies.ts`). Exception: API/domain files like `movies.api.ts`, `query-keys.ts`.
- **Imports**: use `@/` alias for `src/` (e.g. `@/components/ui/button`).
- **shadcn/ui components**: add via `bunx shadcn@latest add <component>`. UI components live in `src/components/ui/`. The `react-refresh/only-export-components` rule is disabled for `src/components/ui/` since shadcn generates mixed exports.
- **Theme**: CSS variables in `src/index.css`. Dark mode toggled via `.dark` class on a parent element (`ThemeProvider` wraps the app). Fonts: DM Sans (body), Outfit (headings).
- **Routing**: TanStack Router with code-based routing. Routes defined in `src/router.tsx`. Pages lazy-loaded. Use `Link`, `useLocation`, `useParams` from `@tanstack/react-router` (never `react-router`).
- **Strict TypeScript**: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly` are all enabled.

## Architecture: Page-Based Structure

Each page is self-contained in `src/pages/{page-name}/` with its own partials, hooks, types, helpers, and utils. Shared code lives in global folders under `src/`.

### Folder Layout

```
src/
├── api/                    # ALL API calls (client.ts, endpoints.ts, movies.api.ts, etc.)
├── components/
│   ├── ui/                 # shadcn-generated components
│   ├── layout/             # Navbar, AppLayout
│   └── MovieCard/
├── hooks/                  # shared hooks
├── types/                  # shared types (movie.types.ts, api.types.ts)
├── helpers/                # shared helpers (formatRating, formatDate, imageUrl)
├── utils/                  # shared utils (cn.ts from shadcn)
├── lib/                    # env.ts, query-client.ts, query-keys.ts
├── pages/
│   ├── home/               # HeroBanner, TrendingSection, GenreList
│   ├── search/             # stub page
│   ├── movie-detail/       # stub page
│   └── watchlist/          # stub page
├── router.tsx              # TanStack Router definitions (code-based)
├── App.tsx                 # QueryClientProvider + RouterProvider
└── main.tsx                # StrictMode + ThemeProvider
```

### Key Rules

- **No `fetch()` or API calls outside `src/api/`**. All HTTP calls go through `src/api/client.ts`.
- **Env vars**: accessed only via `src/lib/env.ts` (validated with Zod). Never use `import.meta.env` directly.
- **Query keys**: centralized in `src/lib/query-keys.ts`. Never hardcode query keys in hooks.
- **Hooks in `pages/{page-name}/hooks/`** call API functions wrapped in `useQuery`/`useMutation`. No fetching logic in partials.
- **Partials** are dumb — they receive data via props from the page's `index.tsx`. Loading/error states handled at page level.
- **Cross-page imports forbidden**: never import from another page's folder. Move shared code to global folders.

### Env Setup

`.env` and `.env.example` exist at root. Required vars:

```
VITE_API_BASE_URL=https://api.themoviedb.org/3
VITE_MOVIE_API_TOKEN=your_token
VITE_IMAGE_BASE_URL=https://image.tmdb.org/t/p
```

## Gotchas

- Both `typecheck` and `build` use `tsc -b` (project references). Never use `tsc --noEmit` — the root `tsconfig.json` has `"files": []` so it checks nothing.
- `verbatimModuleSyntax` means you must use `import type` for type-only imports.
- ESLint ignores `dist/`. React hooks and React Refresh plugins are active.
- Use `bunx` not `npx` for CLI tools (shadcn, etc.).
