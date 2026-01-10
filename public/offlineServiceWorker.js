const VERSION = "v2";
const CACHE_NAME = `board-app-${VERSION}`;

const APP_SHELL = ["/", "/offline.html"]; // keep it small

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("board-app-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    return event.respondWith(handleNavigation(req));
  }

  if (
    req.destination === "script" ||
    req.destination === "style" ||
    req.destination === "image" ||
    req.destination === "font"
  ) {
    return event.respondWith(handleAsset(req));
  }

  if (url.pathname.startsWith("/api/")) {
    return event.respondWith(networkFirstApi(req));
  }
});

async function handleNavigation(request) {
  try {
    // Prefer fresh HTML when online
    const res = await fetch(request);

    // Optionally update cached "/" in the background when online
    const cache = await caches.open(CACHE_NAME);
    await cache.put("/", res.clone());

    return res;
  } catch {
    // Offline fallback: try cached "/" then offline page
    const cache = await caches.open(CACHE_NAME);
    return (await cache.match("/")) || (await cache.match("/offline.html"));
  }
}

async function handleAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

async function networkFirstApi(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const res = await fetch(request);

    // Cache only successful GET responses
    if (res.ok) {
      cache.put(request, res.clone());
    }

    return res;
  } catch {
    // Offline fallback: return cached JSON if available
    const cached = await cache.match(request);
    if (cached) return cached;

    return new Response(
      JSON.stringify({ error: "Offline and no cached data" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}
