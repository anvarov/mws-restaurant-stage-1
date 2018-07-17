const cacheVersion = "version-2";
self.addEventListener("install", () => {
  //here i simply log out install info, because i should cache all website i didn't add here static files like styles, and js.
  console.log("service worker is installed");
});

self.addEventListener("activate", e => {
  //here we will delete unused cache versions
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(thisCache => {
          if (thisCache !== cacheVersion) {
            return caches.delete(thisCache);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", e => {
  caches.match(e.request).then(response => {
    if (response) {
      return response;
    }
    //because it is in stream, we cannot use the same response more than once, i cloned it
    let requestClone = e.request.clone();

    fetch(requestClone)
      .then(response => {
        if (!response) {
          console.log(
            "no response from fetch, maybe something wrong with network"
          );
          return response;
        }
        let responseClone = response.clone();
        caches.open(cacheVersion).then(cache => {
          cache.put(e.request, responseClone);
          return response;
        });
      })
      .catch(err => {
        console.log("something went totally wrong. Error: ", err);
      });
  });
});
