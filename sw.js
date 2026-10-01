/* Townshelf service worker: caches the site shell + sample data for offline use.
   Bump VERSION whenever shell files change; old caches are removed on activate. */
const VERSION = "townshelf-v2";
const SHELL = [
  "./", "index.html", "browse.html", "store.html", "item.html", "cart.html", "list-your-shop.html", "about.html",
  "css/style.css", "js/app.js", "js/art.js", "js/pwa.js", "data/data.js",
  "fonts/DMSans.ttf", "fonts/Fraunces.ttf",
  "manifest.webmanifest", "favicon.png", "favicon.ico",
  "assets/logo-icon.png", "assets/apple-touch-icon.png",
  "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/icons/maskable-192.png", "assets/icons/maskable-512.png"
];

self.addEventListener("install", (event) => {
  // cache: "reload" bypasses the HTTP cache so a new version gets fresh files
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: "reload" })))));
  // no skipWaiting here: the page shows a small "Refresh" bar and asks the new worker to take over
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("townshelf-") && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  // Pages: network first (fresh content when online), cached page when offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy));
        return res;
      }).catch(() =>
        caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match("index.html"))
      )
    );
    return;
  }

  // Static files and data: serve from cache right away, refresh in the background.
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      const net = fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
