# DayRhythm — 24-Hour Life Tracker

A mobile-first PWA inspired by Owaves for visualizing your daily rhythm, balancing work and personal life, and tracking trends over weeks.

![DayRhythm](https://img.shields.io/badge/DayRhythm-PWA-blue)

## Features

- **24-hour circular clock** — Owaves-style visualization of your day
- **Work vs Personal** categorization with tags (Deep Work, Meetings, Exercise, Family, etc.)
- **Day themes** — label each day (Execution Day, Strategy Day, Recovery Day, etc.)
- **Weekly & monthly analytics** — stacked charts, activity breakdowns, life-balance score
- **Google Calendar sync** — export .ics files for direct import
- **JSON export** — structured data for Zapier/Make.com automation
- **Persistent storage** — data saves to localStorage, survives refresh
- **PWA ready** — installs as a home screen app on iPhone/Android
- **Offline capable** — works without internet once installed

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Open on your phone
# → The terminal shows a URL like http://localhost:5173
# → On the same WiFi, use your computer's local IP instead:
#   http://192.168.x.x:5173
```

## Deploy (Free)

### Option A: Vercel (easiest)
```bash
npm install -g vercel
vercel
# Follow prompts → you get a live URL in 30 seconds
```

### Option B: Netlify
```bash
npm run build
# Drag the `dist/` folder to https://app.netlify.com/drop
```

### Option C: GitHub Pages
```bash
npm run build
# Push the `dist/` folder to a `gh-pages` branch
```

## Install as Phone App

Once deployed to a URL:

**iPhone (Safari):**
1. Open the URL in Safari
2. Tap Share → "Add to Home Screen"
3. It opens full-screen like a native app

**Android (Chrome):**
1. Open the URL in Chrome
2. Tap the three-dot menu → "Add to Home Screen"
3. Or accept the install prompt if it appears

## Google Calendar Integration

### Manual (built-in)
1. Go to the **Sync** tab
2. Tap "Export .ics" → downloads a calendar file
3. Open the file → it imports into your default calendar app

### Automated (Zapier/Make.com)
1. Go to the **Sync** tab
2. Tap "Copy JSON" → structured data is on your clipboard
3. Create a Make.com scenario:
   - Trigger: Webhook (custom)
   - Action: Google Calendar → Create Event
   - Map: `title`, `start`, `end`, `category` fields

## Project Structure

```
dayrhythm-app/
├── public/
│   └── favicon.svg          # App icon
├── src/
│   ├── App.jsx               # Main app (all components)
│   ├── main.jsx              # React entry point
│   └── index.css             # Tailwind + mobile styles
├── index.html                # HTML shell with PWA meta tags
├── vite.config.js            # Vite + PWA plugin config
├── tailwind.config.js        # Tailwind with DM Sans font
├── postcss.config.js
├── package.json
└── README.md
```

## Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool + dev server
- **Tailwind CSS 3** — Utility-first styling
- **Recharts** — Charts for analytics
- **Lucide React** — Icons
- **vite-plugin-pwa** — Service worker + manifest generation
- **localStorage** — Client-side persistence

## Customization

### Add new tags
In `src/App.jsx`, find the `TAGS` array and add entries:
```js
{ id: 'prayer', label: 'Prayer', icon: Heart, cat: 'personal' },
```

### Add new categories
Extend the `CATEGORIES` object:
```js
health: { label: 'Health', color: '#059669', light: '#D1FAE5', icon: Heart },
```

### Change day themes
Edit the `DAY_THEMES` array to match your rhythm.

## Notes

- All data stored in browser localStorage (~5MB limit, plenty for years of tracking)
- No backend, no accounts, no data leaves your device
- PWA service worker caches the app for offline use after first visit
- The .ics export is compatible with Google Calendar, Apple Calendar, Outlook, and any CalDAV client

---

Built for Mohammed Ghazzawi's daily rhythm optimization workflow.
