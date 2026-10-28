// 오프라인 지원. 앱 파일은 버전별로 미리 캐시(cache-first), 단어 md는 network-first,
// 폰트는 처음 받을 때 캐시한다. 새 버전은 다음 실행 때 적용된다(열려 있는 페이지는 새로고침하지 않음).
// 배포할 때마다 VERSION을 올린다. 파일을 추가하면 APP_FILES에도 넣는다(tests/pwa.test.js가 확인).
const VERSION = 'v2';
const APP_CACHE = `toeic-app-${VERSION}`;
const FONT_CACHE = 'toeic-fonts-v1';
const FONT_HOSTS = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

const APP_FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './toeic-vocab-500.md',
  './js/store.js',
  './js/core/dates.js',
  './js/core/parser.js',
  './js/core/progress.js',
  './js/core/quiz.js',
  './js/core/records.js',
  './js/core/schedule.js',
  './js/core/session.js',
  './js/core/synonyms.js',
  './js/ui/actions.js',
  './js/ui/dom.js',
  './js/ui/theme.js',
  './js/ui/widgets.js',
  './js/ui/screens/error.js',
  './js/ui/screens/home.js',
  './js/ui/screens/records.js',
  './js/ui/screens/session.js',
  './js/ui/screens/settings.js',
  './js/ui/screens/words.js',
  './js/ui/screens/wrong.js',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then((cache) => cache.addAll(APP_FILES.map((f) => new Request(f, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('toeic-app-') && k !== APP_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// 단어 md: 네트워크를 먼저 쓰되(수정이 바로 반영되게), 신호가 약해 MD_TIMEOUT_MS 안에 오지 않으면
// 캐시 사본으로 먼저 열고 늦게 온 응답은 캐시만 갱신한다.
const MD_TIMEOUT_MS = 3000;
async function networkFirst(event) {
  const { request } = event;
  const cache = await caches.open(APP_CACHE);
  const network = fetch(request).then(async (response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await cache.put(request, response.clone());
    return response;
  });
  event.waitUntil(network.catch(() => {}));
  const cached = await cache.match(request, { ignoreSearch: true });
  if (!cached) return network.catch(() => Response.error());
  const timeout = new Promise((resolve) => setTimeout(() => resolve(cached), MD_TIMEOUT_MS));
  return Promise.race([network.catch(() => cached), timeout]);
}

async function cacheFirst(request, cacheName) {
  const hit = await caches.match(request, { ignoreSearch: cacheName === APP_CACHE });
  if (hit) return hit;
  const response = await fetch(request);
  if (cacheName === FONT_CACHE && (response.ok || response.type === 'opaque')) {
    await (await caches.open(FONT_CACHE)).put(request, response.clone());
  }
  return response;
}

async function navigation(request) {
  const cache = await caches.open(APP_CACHE);
  const hit = (await cache.match(request, { ignoreSearch: true })) ?? (await cache.match('./index.html'));
  if (hit) return hit;
  return fetch(request);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') event.respondWith(navigation(request));
  else if (url.pathname.endsWith('.md')) event.respondWith(networkFirst(event));
  else event.respondWith(cacheFirst(request, APP_CACHE));
});
