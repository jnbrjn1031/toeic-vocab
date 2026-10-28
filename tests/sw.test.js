// sw.js를 가짜 캐시·네트워크와 함께 node:vm에서 실행해 단어 md 요청 처리를 확인한다.
import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const code = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const MD = 'http://app.test/toeic-vocab/toeic-vocab-500.md';
const flush = () => new Promise((r) => setImmediate(() => setImmediate(r)));

function loadWorker(fetchImpl) {
  const store = new Map([[MD, 'cached md']]);
  const cache = {
    match: async (req) => (store.has(req.url ?? req) ? new Response(store.get(req.url ?? req)) : undefined),
    put: async (req, res) => { store.set(req.url ?? req, await res.text()); },
  };
  const listeners = {};
  const self = {
    location: new URL('http://app.test/toeic-vocab/sw.js'),
    addEventListener: (type, fn) => { listeners[type] = fn; },
    skipWaiting() {},
    clients: { claim() {} },
  };
  const context = vm.createContext({
    self, URL, Request, Response, setTimeout, clearTimeout, console,
    fetch: fetchImpl,
    caches: { open: async () => cache, match: (r, o) => cache.match(r, o), keys: async () => [] },
  });
  vm.runInContext(code, context);
  const request = (url) => {
    let responded;
    const waits = [];
    listeners.fetch({ request: new Request(url), respondWith: (p) => { responded = p; }, waitUntil: (p) => waits.push(p) });
    return { responded, waits };
  };
  return { request, store };
}

test('신호가 약해 md 응답이 늦으면 몇 초 안에 캐시 사본을 준다', async () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const { request } = loadWorker(() => new Promise(() => {})); // 응답이 오지 않는 네트워크
    const { responded } = request(MD);
    await flush();
    mock.timers.tick(5000);
    const result = await Promise.race([responded, flush().then(() => 'still waiting')]);
    assert.notEqual(result, 'still waiting');
    assert.equal(await result.text(), 'cached md');
  } finally {
    mock.timers.reset();
  }
});

test('네트워크가 빠르면 새 md를 주고 캐시도 갱신한다 (md 수정 즉시 반영)', async () => {
  const { request, store } = loadWorker(async () => new Response('fresh md'));
  const { responded, waits } = request(MD);
  assert.equal(await (await responded).text(), 'fresh md');
  await Promise.all(waits);
  assert.equal(store.get(MD), 'fresh md');
});

test('오프라인이면 캐시 사본을 준다', async () => {
  const { request } = loadWorker(async () => { throw new TypeError('offline'); });
  assert.equal(await (await request(MD).responded).text(), 'cached md');
});
