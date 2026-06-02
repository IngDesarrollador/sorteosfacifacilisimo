# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project structure

The repository root contains only this file and `README.md`. All application code lives in the `sorteos-facifacilisimo/` subdirectory. Every command below must be run from inside that folder.

```
sorteos-facifacilisimo/
├── src/
│   ├── pages/          # Full-page views (HomePage, SorteoPage, GanadoresPage)
│   ├── components/     # Reusable UI pieces
│   ├── utils/          # commentParser.ts — core parsing logic
│   ├── routes/         # AppRouter.tsx — single router definition
│   └── UI/             # Animated backgrounds
├── public/images/      # Brand images loaded at runtime (logos, watermarks)
└── tailwind.config.js
```

## Dev commands

All commands run from `sorteos-facifacilisimo/`:

```bash
npm run dev       # Vite dev server → http://localhost:5173
npm run build     # Production build → dist/
npm run preview   # Serve the dist/ build locally
```

There is no linter script in `package.json` (ESLint is configured but not wired to a script). There are no tests.

## Architecture

### Three-page SPA flow

The app is a linear wizard: **HomePage → SorteoPage → GanadoresPage**, navigated via React Router v7.

State is passed between pages **entirely through `localStorage`** — there is no shared React context or global state manager. Keys used:

| Key | Written by | Read by |
|---|---|---|
| `plataforma` | HomePage | SorteoPage |
| `comentarios` | HomePage | SorteoPage (single-platform) |
| `comentarios_instagram` | HomePage | SorteoPage |
| `comentarios_facebook` | HomePage | SorteoPage |
| `lista_nombres` | HomePage | SorteoPage |
| `imagenPublicacion` | HomePage | SorteoPage |
| `ganadores` | SorteoPage | GanadoresPage |
| `criterioBusqueda` | SorteoPage | GanadoresPage |
| `sorteoTitulo` | SorteoPage | GanadoresPage |

GanadoresPage redirects to `/sorteo` if `ganadores` is missing from localStorage.

### Comment parsing (`src/utils/commentParser.ts`)

Two exported parsers, each returning `CommentBlock[]`:

- `parseComments(text)` — Instagram format. Structured as `username / date-line / comment-lines`, delimited by `"Foto del perfil de ..."` markers and relative time patterns (`\d+\s*(sem|h|d|min)`).
- `parseCommentsFacebook(text)` — Facebook format. Blocks are `username / comment / date`, terminated by `"Responder"`, `"Ocultar"`, or another profile photo marker.

The `CommentBlock` interface:
```ts
{ username: string; date: string; comment: string; rawBlock: string; }
```

SorteoPage adds a `platform` property (`'instagram' | 'facebook'`) at runtime after parsing.

### Filter/search logic (SorteoPage)

Four search modes, all operating on the in-memory `CommentBlock[]` array:

- **aleatorio** — Fisher-Yates-style shuffle (`sort(() => 0.5 - Math.random())`) then `slice(0, maxWinners)`.
- **numero** — matches digit sequences in `comment`; if `orden=false`, generates all permutations of the digit string first (`getPermutations`).
- **palabra** — case-insensitive `includes`.
- **marcador** — case-sensitive `includes` (for symbols/emoji markers).

### PDF export (GanadoresPage)

Uses **jsPDF + jspdf-autotable**. Images are fetched from `/images/` at runtime and converted to base64 via `getBase64FromUrl()`. The `@ts-ignore` around `doc.setGState` / `doc.context2d` is intentional — the jsPDF opacity API is not covered by the installed `@types/jspdf` version.

Emojis are stripped from comment cells via Unicode range regex before inserting into the table.

### Tailwind theme

Custom brand colors defined in `tailwind.config.js`:
- `primary` → `#0033A0` (blue)
- `secondary` → `#E30613` (red)
- `accent` → `#FFE000` (yellow)

Note: line 13 in `tailwind.config.js` has a typo (`nimation` instead of `animation`) — the custom animation classes (`marquee`, `fadeIn`, `floatConfetti`) are defined under `keyframes` and work, but the shorthand `animation` utilities won't generate from that key.

### File upload

`FileUploaderProps.tsx` handles `.txt` files via `FileReader`. For Excel (`.xlsx`), parsing is done inline in `HomePage.handleNombresFile` using the `xlsx` library — only the **first column** of the first sheet is extracted as names.

`BackgroundChecker.tsx` exists in `src/UI/` but is unused (commented out in `App.tsx`).

## Deployment

Hosted on Vercel as a static site. `vercel.json` has an SPA fallback route so direct navigation to `/sorteo` or `/ganadores` works. The build base path in `vite.config.ts` is `./` (relative), which is required for Vercel's static asset resolution.
