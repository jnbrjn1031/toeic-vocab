import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const walk = (dir) => readdirSync(new URL(dir, root), { recursive: true, withFileTypes: true })
  .filter((e) => e.isFile())
  .map((e) => `${e.parentPath ?? e.path}/${e.name}`.replace(/\\/g, '/').split(`/${dir}/`).pop())
  .map((p) => `${dir}/${p}`);

test('service worker가 앱 파일을 모두 미리 캐시함 (빠지면 오프라인에서 깨짐)', () => {
  const listed = new Set([...read('sw.js').matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]));
  const files = ['', 'index.html', 'styles.css', 'app.js', 'manifest.webmanifest', 'toeic-vocab-500.md', ...walk('js'), ...walk('icons')];
  for (const f of files) assert.ok(listed.has(f), `sw.js APP_FILES에 없음: ./${f}`);
});

test('manifest: 상대 경로, standalone, 아이콘 파일 존재', () => {
  const m = JSON.parse(read('manifest.webmanifest'));
  assert.equal(m.start_url, './');
  assert.equal(m.scope, './');
  assert.equal(m.display, 'standalone');
  assert.equal(m.lang, 'ko');
  const sizes = m.icons.map((i) => `${i.sizes} ${i.purpose ?? 'any'}`);
  assert.ok(sizes.includes('192x192 any'));
  assert.ok(sizes.includes('512x512 any'));
  assert.ok(sizes.includes('512x512 maskable'));
  for (const i of m.icons) assert.ok(existsSync(new URL(i.src, root)), i.src);
  assert.ok(existsSync(new URL('icons/apple-touch-icon.png', root)));
});
