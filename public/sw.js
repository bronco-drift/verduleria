// Service worker: network-first para el HTML (cada deploy se ve al toque),
// stale-while-revalidate para assets. El cache queda como fallback offline.
const CACHE = "izifud-v2";
const SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icon-512.svg",
  "/icon-maskable.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL).catch(() => null))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // HTML/navegación: network-first — así el último deploy se ve siempre;
  // el cache solo responde si no hay red (modo offline)
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => null);
          }
          return response;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match("/index.html")))
    );
    return;
  }

  // Stale-while-revalidate para Leaflet CDN
  if (url.hostname === "unpkg.com") {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Geocoder Nominatim siempre va a la red
  if (url.hostname.includes("nominatim")) {
    event.respondWith(fetch(req).catch(() => new Response("[]", { headers: { "Content-Type": "application/json" } })));
    return;
  }

  // Same-origin: cache-first con actualización en background
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }
});

function staleWhileRevalidate(req) {
  return caches.open(CACHE).then((cache) =>
    cache.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((response) => {
          if (response && response.ok) {
            cache.put(req, response.clone()).catch(() => null);
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
}
