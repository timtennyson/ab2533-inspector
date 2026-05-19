/* Update strategy:
 *   - App code (html/js/css/checklist) = NETWORK-FIRST so a deploy lands
 *     immediately when online; falls back to cache when offline.
 *   - Large, rarely-changing binaries (pdf-lib, the official PLG-264 PDF,
 *     icons, manifest) = CACHE-FIRST to avoid re-downloading ~1 MB each launch.
 * This ends the "bump version + manual reopen dance" — online users always
 * get the latest, offline users still work.
 */
var CACHE = "ab2533-v7";
var PRECACHE = [
  "./", "./index.html", "./styles.css", "./app.js",
  "./data/checklist.js", "./data/plg264-fields.js", "./manifest.webmanifest",
  "./vendor/pdf-lib.min.js", "./data/PLG-264.pdf"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(PRECACHE); }));
  self.skipWaiting();
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) {
      if (k !== CACHE) return caches.delete(k);
    }));
  }).then(function () { return self.clients.claim(); }));
});

function putCache(req, resp) {
  var copy = resp.clone();
  caches.open(CACHE).then(function (c) { c.put(req, copy); });
  return resp;
}

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  var sameOrigin = url.origin === self.location.origin;
  // Network-first for app shell/code; exclude the big vendored PDF lib.
  var isCode = sameOrigin &&
    (e.request.mode === "navigate" || /\.(html|js|css)$/.test(url.pathname)) &&
    !/pdf-lib\.min\.js$/.test(url.pathname);

  if (isCode) {
    e.respondWith(
      fetch(e.request, { cache: "no-cache" })
        .then(function (resp) { return putCache(e.request, resp); })
        .catch(function () {
          return caches.match(e.request).then(function (r) {
            return r || caches.match("./index.html");
          });
        })
    );
    return;
  }
  // Cache-first for everything else (large/static assets).
  e.respondWith(
    caches.match(e.request).then(function (r) {
      return r || fetch(e.request).then(function (resp) {
        return putCache(e.request, resp);
      }).catch(function () { return caches.match("./index.html"); });
    })
  );
});
