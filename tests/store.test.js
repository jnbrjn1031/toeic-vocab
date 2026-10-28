import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY, loadData, saveData } from '../js/store.js';
import { defaultData, recordAnswer } from '../js/core/records.js';

const fake = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)),
  removeItem: (k) => m.delete(k), key: (i) => [...m.keys()][i] ?? null, get length() { return m.size; }, _m: m }; };

test('비어 있으면 기본값', () => assert.deepEqual(loadData(fake()), defaultData()));

test('저장 후 불러오기', () => {
  const s = fake(); const d = recordAnswer(defaultData(), 'submit', false, '2026-10-29');
  assert.equal(saveData(d, s), true);
  assert.deepEqual(loadData(s), d);
});

test('깨진 값은 따로 보관하고 기본값', () => {
  const s = fake(); s.setItem(STORAGE_KEY, '{broken');
  assert.deepEqual(loadData(s), defaultData());
  assert.ok([...s._m.keys()].some((k) => k.startsWith(`${STORAGE_KEY}:corrupt-`)));
});

test('저장 실패는 false', () => {
  const s = fake(); s.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.equal(saveData(defaultData(), s), false);
});
