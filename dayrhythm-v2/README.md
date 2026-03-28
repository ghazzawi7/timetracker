# DayRhythm v2 — 24-Hour Life Tracker

A mobile-first PWA for visualizing your daily rhythm with an Owaves-inspired circular clock, vertical timeline, custom categories, and trend analytics.

## What's New in v2

- **Custom Categories** — Create, rename, delete. Each gets a Lucide icon + color
- **Custom Tags** — Add/delete tags linked to categories
- **Full Color Picker** — Per-block hex/wheel color override
- **Drag Interactions** — Drag block edges to resize, drag middle to move (30-min snapping) — works on both the circle AND vertical timeline
- **4 Tabs** — Rhythm (circle), Timeline (24h vertical), Trends (analytics), Sync (export)
- **Labels on Circle** — Block titles + category icons render directly on arc segments
- **Live Indicator** — Active block gets a glow effect on the circle
- **Remaining Hours** — Center of circle shows unallocated time
- **Vertical Timeline** — Full 24h scroll with tap-to-add on empty gaps
- **Templates** — Save/load named day templates (Work Day, Weekend, etc.)
- **Custom Day Themes** — Free text (type whatever you want)
- **Dynamic Analytics** — All charts stack custom categories (no hardcoded Work/Personal)

## Quick Start

```bash
npm install
npm run dev
```

## Deploy (Free)

```bash
# Vercel (fastest)
npx vercel

# Netlify
npm run build
# drag dist/ to https://app.netlify.com/drop
```

## Install on Phone

1. Deploy to any URL (Vercel, Netlify, GitHub Pages)
2. Open in Safari (iPhone) or Chrome (Android)
3. Add to Home Screen — opens as a standalone app

## Project Structure

```
dayrhythm-v2/
├── public/
│   ├── favicon.svg
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── App.jsx            # Full application (~1100 lines)
│   ├── main.jsx           # React entry
│   └── index.css          # Tailwind + mobile styles
├── index.html
├── vite.config.js         # Vite + PWA
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Tech Stack

React 18 · Vite 5 · Tailwind CSS 3 · Recharts · Lucide React · vite-plugin-pwa · localStorage

## Data

All data stored in browser localStorage. No backend, no accounts, no data leaves your device. PWA caches the app for offline use.

---

Built for Mohammed Ghazzawi.
