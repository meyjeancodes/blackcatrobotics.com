// BlackCat OS Service Worker
// Caches procedure data for offline AR mode use

const CACHE_NAME = "blackcat-os-v1";
const OFFLINE_URLS = [
  "/",
  "/dashboard",
  "/ar-mode",
  "/maintenance",
  "/certifications",
  "/acquire",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Cache-first for navigation, network-first for API
  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/api/")) {
    // Network-first for API routes
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then((r) => r ?? new Response("Offline", { status: 503 }))
      )
    );
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        if (res.ok && event.request.method === "GET") {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        }
        return res;
      });
    })
  );
});
