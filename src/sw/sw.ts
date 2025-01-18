/// <reference lib="webworker" />

const s = self as unknown as ServiceWorkerGlobalScope;

s.addEventListener("install", async (event) => {
  console.log("installing!");
  s.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await s.caches.open(swCacheName);
      return cache.addAll(swFilePaths);
    })()
  );
});

s.addEventListener("activate", async (event) => {
  console.log("activating!");
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const deletePromises = keys
        .filter((key) => key !== swCacheName)
        .map((key) => s.caches.delete(key));
      return Promise.all(deletePromises);
    })()
  );
});

s.addEventListener("fetch", (event) => {
  (async () => {
    const cache = await s.caches.open(swCacheName);
    const cached_response = await cache.match(event.request);
    const pending_response = fetch(event.request).then((response) => {
      cache.put(event.request, response.clone());
      return response;
    });
    event.respondWith(cached_response || pending_response);
  })();
});

export {};
