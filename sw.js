// Lore service worker
// Bumped when shipping. Cache name change = full re-fetch.
// Bump this string on every deploy — it forces clients to discard the old cached app shell.
const CACHE_VERSION = "lore-v0.5.3";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icon.svg",
  "/icon-maskable.svg",
  // The prototype links the QR library from CDN; cache it on first hit
];

// Install: cache the shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
  );
  self.skipWaiting();
});

// Activate: clean up old versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
//  - HTML/CSS/JS app shell: cache-first, falling back to network
//  - Wikipedia / OSM data: network-first, falling back to cache (so dad gets fresh content when online but offline-survives)
//  - ElevenLabs / Supabase audio: cache-first (audio rarely changes; bandwidth heavy)
//  - Everything else: network-first
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const isAppShell = APP_SHELL.includes(url.pathname) || url.pathname.endsWith(".html");
  const isMedia = /\.(png|jpe?g|svg|webp|mp3|mp4|webm)$/i.test(url.pathname);
  const isApiData = /wikipedia\.org|overpass|wikimedia\.org/i.test(url.hostname);
  const isAudio = /supabase\.co\/storage.+\.mp3$/i.test(url.href) || /elevenlabs/i.test(url.hostname);

  if (isAppShell) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        return res;
      }))
    );
    return;
  }

  if (isAudio || isMedia) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req)))
    );
    return;
  }

  if (isApiData) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Default: just hit the network
});
