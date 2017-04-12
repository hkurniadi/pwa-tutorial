// This cacheName is for the application data
// separate from the application shell cache
var dataCacheName = 'weatherData-v1';

// This file lives in the root directory
// so, the service worker scope is the application root
// This cacheName is for the application shell
var cacheName = 'weatherPWA-step-6-3';
// The variable below is to store all the assets
// that need to be cached for the offline experience
// i.e. the minimum required assets for the application shell
var filesToCache = [
  '/',
  '/index.html',
  '/scripts/app.js',
  '/styles/inline.css',
  '/images/clear.png',
  '/images/cloudy-scattered-showers.png',
  '/images/cloudy.png',
  '/images/fog.png',
  '/images/ic_add_white_24px.svg',
  '/images/ic_refresh_white_24px.svg',
  '/images/partly-cloudy.png',
  '/images/rain.png',
  '/images/scattered-showers.png',
  '/images/sleet.png',
  '/images/snow.png',
  '/images/thunderstorm.png',
  '/images/wind.png'
];

// This is to install the service worker in your app
self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  // event.waitUntil(promise) method is to extend the lifetime of an event
  // so, the event (i.e. e), in this case 'install' is not
  // going to be considered 'installed' until the below
  // promise resolves successfully
  e.waitUntil(
    // caches.open will open a cache object and give it a name
    // caches methods are async and will return a promise
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

// This is to update the service worker when the content is changed
// BUT, this is not suitable for production because
// the cacheName key has to be changed every time there is an update
// otherwise, old service worker and content will be served
self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }))
    })
  );
  // clients.claim will claim that the new service worker
  // to be activated faster, otherwise,
  // the new service worker will still be in the 'waiting' state
  return self.clients.claim();
});

// This is to 'intercept' the requests from client,
// and handle them within the service worker
// i.e. we determine how we want to handle the request
// and to serve our cached responses
self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
  if (e.request.url.indexOf(dataUrl) > -1) {
    /*
     * When the request URL contains dataUrl, the app is asking for fresh
     * weather data. In this case, the service worker always goes to the
     * network and then caches the response. This is called the "Cache then
     * network" strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
     */
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        return fetch(e.request).then(function(response) {
          cache.put(e.request.url, response.clone());
          return response;
        })
      })
    );
  } else {
    /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, falling back to the network" offline strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
     */
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});