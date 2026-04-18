// RescuePaws Service Worker
// Strategy: Cache-first for static assets, network-first for API/Firebase calls

const CACHE_NAME = "rescuepaws-v1";

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  "/",
  "/map",
  "/login",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/images/gcash_qr.jpg",
];

// Install: pre-cache key assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Pre-cache failed for some assets:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: smart caching strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, Chrome extensions, and Firebase/API calls
  if (
    request.method !== "GET" ||
    url.protocol === "chrome-extension:" ||
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("firebase") ||
    url.hostname.includes("nominatim") ||
    url.hostname.includes("openstreetmap")
  ) {
    return; // Let these go through the network as-is
  }

  // Map tiles: cache-first (they almost never change)
  if (url.hostname.includes("cartocdn.com") || url.hostname.includes("tile")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
      )
    );
    return;
  }

  // Everything else: network-first, fall back to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
