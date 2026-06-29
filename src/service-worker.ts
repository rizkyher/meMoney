import { build, files, version } from '$service-worker';

const CACHE = `dompet-pribadi-${version}`;
const APP_SHELL = [...build, ...files, '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        if (response.ok && new URL(request.url).origin === location.origin) {
          event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        return cached ?? caches.match('/app/dashboard') ?? new Response('Offline', { status: 503 });
      })
  );
});
