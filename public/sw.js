// Service worker: saves the app's files on the phone so Nigthy still opens
// with no signal (e.g. underground on the train).
const CACHE = 'nigthy-v1'

// Save the main page right away, and take over without waiting for a reload.
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add('/')))
  self.skipWaiting()
})

self.addEventListener('activate', () => self.clients.claim())

// For every file the app loads: try the internet first so updates show up,
// save a copy, and if there's no internet use the saved copy instead.
self.addEventListener('fetch', (event) => {
  const sameSite = new URL(event.request.url).origin === self.location.origin
  if (event.request.method !== 'GET' || !sameSite) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, copy))
        }
        return response
      })
      .catch(() => caches.match(event.request)),
  )
})
