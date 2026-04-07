import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icon-192-maskable.png', 'icon-512-maskable.png'],
      manifest: {
        name: 'DayRhythm — 24hr Life Tracker',
        short_name: 'DayRhythm',
        description: 'Visualize and balance your 24-hour rhythm',
        theme_color: '#0F172A',
        background_color: '#F8FAFC',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Do NOT use navigateFallback. Cloudflare Pages _redirects handles SPA
        // routing server-side (/* → index.html 200). Using navigateFallback
        // causes "Response served by service worker has redirections" on Safari/
        // iOS because Workbox ends up serving a redirected Response object —
        // which WebKit refuses — when Cloudflare normalises the OAuth callback URL.
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
});
