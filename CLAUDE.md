# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

No test suite is configured.

## Environment

Requires a `.env` file with:
```
VITE_GOOGLE_FONTS_API_KEY=...
```

See `.env.example`. The key is used to fetch the Google Fonts catalog.

## Architecture

**Glyph Inventory** is a typographic exploration tool: browse Google Fonts, pick a font variant, and inspect every glyph with its Unicode/HTML/CSS/JS/Python/SVG representations.

### Component tree

```
App                     — holds selected font state
├── FontList            — left sidebar; search, category filter, virtualized list
└── GlyphGrid           — main area; variant picker, virtualized glyph grid
    ├── GlyphCell       — single cell (memoized); renders char or SVG path
    └── GlyphDetail     — right panel on selection; shows all representations + copy buttons
```

### Data flow

1. `useFontList` fetches the full font catalog from `https://www.googleapis.com/webfonts/v1/webfonts`.
2. Selecting a font triggers `useFont`, which fetches the TTF file directly from the URL in the API response, parses it with **opentype.js**, injects an `@font-face` rule into the DOM (family name: `ge-{family}-{variant}`), and caches the parsed font object in memory.
3. `GlyphGrid` iterates glyphs from the parsed font and virtualizes the grid with **@tanstack/react-virtual** via a `ResizeObserver`-driven column count.
4. `src/utils/representations.js` converts a Unicode codepoint into all display formats shown in `GlyphDetail`.

### Rendering glyphs

- Printable characters (codepoint ≥ 32) render as text using the injected font face.
- Non-printable glyphs render as SVG paths via `opentype.js` `glyph.getPath()`.
- Empty glyphs (no contours) show `∅`.

### Performance notes

- Both the font list and glyph grid are virtualized — avoid patterns that force full list renders.
- Parsed font objects and blob object URLs are cached in module-level maps inside `useFont`; mutations outside that hook will break the cache.
- `GlyphCell` is wrapped in `React.memo` — keep its props stable.
