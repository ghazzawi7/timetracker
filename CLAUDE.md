# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**DayRhythm** — a mobile-first PWA for 24-hour daily time tracking. The working app lives in `dayrhythm-app/`. The `dayrhythm-v2/` folder is a legacy source directory that was merged in; treat it as read-only reference only.

Deployed at: `https://tracker.ghazzawi.me` (Cloudflare Pages)

## Commands

All commands run from `dayrhythm-app/`:

```bash
npm install          # install deps (includes sharp for icon generation)
npm run dev          # dev server at localhost:5173 (use --host for LAN/phone access)
npm run build        # production build → dist/
npm run preview      # preview the dist/ build locally
```

**Deploy to production** (Cloudflare Pages auto-builds from GitHub — do NOT use Wrangler or Netlify):
```bash
npm run build                            # verify build passes locally first
git add . && git commit -m "message" && git push   # triggers auto-deploy
```

**Regenerate PWA icons after changing `public/favicon.svg`:**
```bash
node -e "
const sharp = require('sharp');
const fs = require('fs');
const svg = fs.readFileSync('public/favicon.svg');
Promise.all([
  sharp(svg).resize(192, 192).png().toFile('public/icon-192.png'),
  sharp(svg).resize(512, 512).png().toFile('public/icon-512.png'),
]).then(() => console.log('Icons generated'));
"
```

## Architecture

The entire application is a **single file**: `src/App.jsx` (~1400 lines). There is no routing, no API layer, no backend. All state lives in React and is persisted to `localStorage` under the key `dayrhythm_v2`.

### Data model

```
state {
  version: 2,
  categories: [{ id, name, icon, color }],
  tags:       [{ id, name, catId }],
  days:       { "YYYY-MM-DD": { theme, blocks: [block] } },
  templates:  [{ id, name, blocks: [block] }],
}

block {
  id, title, catId, tagId, color,
  start: number,   // decimal hour 0–24 (e.g. 9.5 = 9:30 AM)
  end:   number,   // same; end < start means overnight
  gcalEventId?: string   // set after Google Calendar sync
}
```

All times are **decimal hours** (0–24). `snap30()` quantises to 30-minute intervals. Overnight blocks have `end < start` (e.g. sleep 22→6). `dur(a, b)` handles the wrap correctly.

### Component map (`src/App.jsx`)

| Component | Role |
|---|---|
| `CircularClock` | SVG 24h donut clock; drag-to-move/resize blocks; overlap prevention via `noOverlap()` |
| `VerticalTimeline` | Linear 0–24h scrollable list; 10px dead-zone before drag activates |
| `BlockEditor` | Modal for create/edit; inline new-category and new-tag flows |
| `TemplatePanel` | Save/load day templates |
| `AnalyticsView` | Recharts bar + area charts; weekly and monthly breakdowns |
| `GoogleCalSync` | OAuth2 via Google Identity Services (GIS); auto-sync UI |
| `ExportView` | Houses `GoogleCalSync` + .ics download |
| `DayRhythmV2` | Root component; owns all state; wires everything |

### Google Calendar auto-sync

**Engine:** `syncDiff()` (module-level async function, not a component) diffs `prevBlocks` vs `currBlocks` and issues `POST`/`PUT`/`DELETE` to the Calendar API.

**Flow in `DayRhythmV2`:**
1. `gcalToken` + `gcalCalId` are stored in both React state and `localStorage`.
2. A debounced `useEffect` (1.5s) watches `blocks`. On change it calls `syncDiff`.
3. When a block is first created in GCal, the returned `gcalEventId` is written back onto the block via `handleGcalBlockCreated`.
4. `GoogleCalSync` (UI component) calls `onTokenChange` / `onCalIdChange` props to update the root state when the user connects, disconnects, or switches calendars.

**Critical ordering rule:** The auto-sync `useEffect` and `syncRef` must be declared **after** `const blocks = dayData.blocks` — placing them before it causes a temporal dead zone crash (blank screen).

### PWA

`vite-plugin-pwa` generates the service worker and manifest. Icon assets are `public/favicon.svg`, `public/icon-192.png`, `public/icon-512.png`. After changing the SVG, regenerate PNGs with the sharp script above.

## Key constants (all in `src/App.jsx`)

- `SK = "dayrhythm_v2"` — localStorage key
- `DAY_THEMES` — predefined day theme options for the header dropdown
- `DEFAULT_CATEGORIES` / `DEFAULT_TAGS` — seeded on first load
- `PRESET_COLORS` — 16-colour palette used in `ColorPicker`
- `hourH = 56` — pixels per hour in `VerticalTimeline`
