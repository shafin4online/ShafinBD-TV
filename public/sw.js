const CACHE_NAME = "shafinbd-tv-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/src/main.tsx",
  "/src/App.tsx",
  "/src/index.css",
  "/manifest.json"
];

// Install event - caching basic static app shell resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - cleaning up older caches if present
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - handle requests with dynamic fallback matching
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // CRITICAL: NEVER cache video streams, live playlist requests, or external m3u8 segments
  // This ensures optimal live playback, avoids caching gigabytes of video, and prevents player stalls.
  if (
    requestUrl.pathname.endsWith(".m3u8") ||
    requestUrl.pathname.endsWith(".ts") ||
    requestUrl.pathname.endsWith(".mp4") ||
    requestUrl.hostname.includes("vedge") ||
    requestUrl.hostname.includes("akamaized") ||
    requestUrl.hostname.includes("cloudfront") ||
    requestUrl.hostname.includes("infomaniak")
  ) {
    return; // Pass through to network directly
  }

  // Only handle GET requests for offline caching
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in background (Stale-While-Revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Cool, user is completely offline. Let background update fail gracefully
          });
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Cache successful requests dynamically if they are from our origin
        if (
          response &&
          response.status === 200 &&
          response.type === "basic" &&
          !requestUrl.pathname.includes("/api/")
        ) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      });
    })
  );
});
