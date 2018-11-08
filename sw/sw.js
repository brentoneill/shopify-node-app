const VERSION = 1;
const CACHE_NAME = `${VERSION}-shopify-pwa-cache`;
const CACHE_URLS = [
  "/",
  "/collections",
  "/collections/all",
  "/products/293t5lrt",
  "https://toddreed-dev.myshopify.com/7954858073/digital_wallets/dialog"
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

self.addEventListener("install", event => {
  console.info(`[ServiceWorker] ${VERSION} installing...`);
  self.skipWaiting();
  console.info(`[ServiceWorker] C9L-SW ${VERSION} SKIP WAITING`);
});

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

self.addEventListener("fetch", event => {
  console.log("sw heard the fetch");

  if (
    event.request.method === "GET" &&
    event.request.destination !== "script" &&
    event.request.destination !== "image" &&
    event.request.destination !== "style"
  ) {
    console.log(event.request);
  }

  event.respondWith(fetch(event.request));

  // event.respondWith(async function() {
  //   let cache = await caches.open(CACHE_NAME);
  //   console.log(cache);
  //   const cachedResponse = await cache.match(event.request);
  //
  //   if (cachedResponse) {
  //     console.log("there is a cached response");
  //     console.log(cachedResponse);
  //     return cachedResponse.clone();
  //   } else {
  //     return fetch(event.request).then(fetchedResponse => {
  //       cache.put(event.request, fetchedResponse.clone());
  //       return fetchedResponse;
  //     });
  //   }
  // });
});
