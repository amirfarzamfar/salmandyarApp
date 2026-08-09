/* eslint-disable no-restricted-globals */
/* global self, Response, Request, caches, fetch */

const CACHE_VERSION = 'salmandyar-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const IMAGES_CACHE = `${CACHE_VERSION}-images`;
const FONTS_CACHE = `${CACHE_VERSION}-fonts`;

const OFFLINE_FALLBACK_URL = '/offline';

const CORE_STATIC_ASSETS = [
  '/',
  OFFLINE_FALLBACK_URL,
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/icons/icon-192x192-maskable.svg',
  '/icons/icon-512x512-maskable.svg',
  '/icons/apple-touch-icon.svg',
];

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/nurse-portal',
  '/portal',
  '/login',
  '/register',
  '/forgot-password',
];

const isProtectedPath = (pathname) =>
  PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

const isApiRequest = (url) =>
  url.pathname.startsWith('/api/') ||
  /^https?:\/\/.*\/api\/.*$/i.test(url.href);

const isStaticAsset = (url) =>
  url.pathname.startsWith('/_next/static/') ||
  url.pathname.startsWith('/_next/image');

const isImageRequest = (url) =>
  /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i.test(url.pathname);

const isFontRequest = (url) =>
  /\.(?:woff|woff2|ttf|otf|eot)$/i.test(url.pathname);

const isCssJsRequest = (url) =>
  /\.(?:css|js|mjs)$/i.test(url.pathname);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(CORE_STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.error('[SW] Install cache addAll failed:', err);
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(CACHE_VERSION))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request, cacheName, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(request, {
      signal: controller.signal,
      credentials: 'same-origin',
    });
    clearTimeout(timeoutId);
    const cache = await caches.open(cacheName);
    try {
      cache.put(request, response.clone());
    } catch {
      /* ignore */
    }
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(request, cacheName, options = {}) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request, { credentials: 'same-origin' });
  if (response && response.status === 200) {
    const cache = await caches.open(cacheName);
    try {
      cache.put(request, response.clone());
    } catch {
      /* ignore */
    }
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  const networkFetch = fetch(request, { credentials: 'same-origin' })
    .then(async (response) => {
      if (response && response.status === 200) {
        const cache = await caches.open(cacheName);
        try {
          cache.put(request, response.clone());
        } catch {
          /* ignore */
        }
      }
      return response;
    })
    .catch(() => cached);

  return cached || networkFetch;
}

async function networkOnly(request) {
  return fetch(request, { credentials: 'same-origin' });
}

async function offlineFallbackDocument(request) {
  return (
    (await caches.match(request)) ||
    (await caches.match(OFFLINE_FALLBACK_URL)) ||
    Response.error()
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.origin !== location.origin) {
    return;
  }

  if (isApiRequest(url)) {
    event.respondWith(networkOnly(request));
    return;
  }

  if (isProtectedPath(url.pathname)) {
    if (request.mode === 'navigate') {
      event.respondWith(
        networkFirst(request, RUNTIME_CACHE, 10000).catch(() =>
          offlineFallbackDocument(request)
        )
      );
    } else {
      event.respondWith(networkFirst(request, RUNTIME_CACHE, 10000));
    }
    return;
  }

  if (isFontRequest(url)) {
    event.respondWith(cacheFirst(request, FONTS_CACHE));
    return;
  }

  if (isImageRequest(url)) {
    event.respondWith(cacheFirst(request, IMAGES_CACHE));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (isCssJsRequest(url)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, RUNTIME_CACHE, 10000).catch(() =>
        offlineFallbackDocument(request)
      )
    );
    return;
  }

  event.respondWith(
    networkFirst(request, RUNTIME_CACHE, 10000).catch(() =>
      caches.match(request).then((r) => r || Response.error())
    )
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
