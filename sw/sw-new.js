const VERSION = 2;
const CACHE_NAME = `${VERSION}-shopify-pwa-cache`;
const CACHE_URLS = [
  "/",
  "/collections",
  "/collections/all",
  "/products/293t5lrt"
];

/*
	Add a list of urls to a certain cache
*/
const addToCache = async (cacheName, urls, bulk) => {
  bulk = bulk || false;
  try {
    let cache = await caches.open(cacheName);
    if (bulk) {
      cache.addAll(urls);
    } else {
      urls.forEach(async function(url) {
        let hasMatch = await cache.match(url);
        if (!hasMatch) {
          try {
            await cache.add(url);
          } catch (ex) {}
        }
      });
    }
  } catch (ex) {
    console.error(ex);
  }
};

/*
	INSTALL Listener
*/
self.addEventListener("install", event => {
  console.info(`[ServiceWorker] ${VERSION} installing...NEW`);
  self.skipWaiting();
  console.info(`[ServiceWorker] C9L-SW ${VERSION} SKIP WAITING`);
});

/*
	ACTIVATE listener
*/
self.addEventListener("activate", event => {
  console.log(
    `[ACTIVATE ServiceWorker] ${VERSION} activated. Now ready to handle fetches!`
  );

  clients.claim();
  event.waitUntil(addToCache(CACHE_NAME, CACHE_URLS, true));

  // Delete old caches when activating new worker(\?.*)?
  event.waitUntil(
    caches
      .keys()
      .then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key && !key.includes(VERSION)) {
              console.log(`[ServiceWorker] deleting cache, ${key}`);
              return caches.delete(key);
            }
          })
        );
      })
      .catch(err => {
        console.log("Clearing old caches failed!");
      })
  );
});

/*
	ACTIVATE listener
*/
self.addEventListener("fetch", event => {
  // Open cache and respond w/ cache response or get new response and save to cache
  // --from: https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        if (response) {
          console.log("responding from cache", response, event.request);
        }

        return (
          response ||
          fetch(event.request).then(response => {
            cache.put(event.request, response.clone());
            return response;
          })
        );
      });
    })
  );
});

/*
	MESSAGE` listener
*/
self.addEventListener("message", event => {
  const { data } = event;

  // Clear the cache predictively
  if (data.command === "clearCache") {
    console.log(
      "[ServiceWorker] received message to clear old caches!!! >>>",
      event
    );
    clearOldCaches();
  }

  // Handle caching of pages predictively
  if (data.command === "addToCache") {
    addToCache(CACHE_NAME, data.payload, true);
  }
});
