import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg', 'favicon.ico',
        'apple-touch-icon.png',
        'icon-120.png', 'icon-152.png', 'icon-180.png',
        'icon-192.png', 'icon-512.png',
        'icon-192-maskable.png', 'icon-512-maskable.png',
        'splash/*.png',
      ],
      manifest: {
        name: 'DayRhythm — 24hr Life Tracker',
        short_name: 'DayRhythm',
        description: 'Visualize and balance your 24-hour rhythm',
        theme_color: '#0F172A',
        background_color: '#0F172A',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon-120.png', sizes: '120x120', type: 'image/png', purpose: 'any' },
          { src: '/icon-152.png', sizes: '152x152', type: 'image/png', purpose: 'any' },
          { src: '/icon-180.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
});
