import { precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

// Take control of all clients immediately on activation
clientsClaim();
self.skipWaiting();

// Precache all Vite-built assets (injected by vite-plugin-pwa at build time)
precacheAndRoute(self.__WB_MANIFEST);

// ── Fetch handler ──────────────────────────────────────────────────────────
// MUST be added AFTER precacheAndRoute so the precache route runs first for
// known assets. This handler catches everything else and enforces two rules:
//
//  1. Navigation requests (mode === 'navigate') are NEVER intercepted.
//     Safari/WebKit throws "Response served by service worker has redirections"
//     if event.respondWith() is called with a Response that has redirected:true.
//     OAuth flows involve server-side redirects, so navigation MUST pass through.
//
//  2. Google / OAuth URLs are never intercepted — they need fresh network
//     responses and may involve redirects that would trip the WebKit check.
//
// For all other sub-resource requests that didn't match the precache above
// (e.g. dynamic requests) we do a simple network-first fallback.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Rule 1 — never intercept navigation requests
  if (request.mode === 'navigate') return;

  // Rule 2 — never intercept Google / OAuth / googleapis URLs
  if (
    url.hostname.includes('google') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('gstatic') ||
    url.pathname.includes('/oauth') ||
    url.search.includes('code=') ||
    url.search.includes('state=')
  ) return;

  // For everything else that wasn't matched by the precache route above,
  // try the network and fall back to cache.
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
