import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseVocab } from '../js/core/parser.js';
import { TOTAL_DAYS, setsForDay, newSetForDay, dayCards } from '../js/core/schedule.js';

const { sets } = parseVocab(readFileSync(new URL('../toeic-vocab-500.md', import.meta.url), 'utf8'));

test('1·2·3·50·51·52일차 세트', () => {
  assert.deepEqual(setsForDay(1), [1]);
  assert.deepEqual(setsForDay(2), [1, 2]);
  assert.deepEqual(setsForDay(3), [1, 2, 3]);
  assert.deepEqual(setsForDay(50), [48, 49, 50]);
  assert.deepEqual(setsForDay(51), [49, 50]);
  assert.deepEqual(setsForDay(52), [50]);
});

test('모든 세트가 정확히 3일 연속 등장', () => {
  const seen = new Map();
  for (let d = 1; d <= TOTAL_DAYS; d++) for (const s of setsForDay(d)) seen.set(s, [...(seen.get(s) ?? []), d]);
  assert.equal(seen.size, 50);
  for (const [s, days] of seen) assert.deepEqual(days, [s, s + 1, s + 2]);
});

test('새 세트와 범위', () => {
  assert.equal(newSetForDay(1), 1);
  assert.equal(newSetForDay(50), 50);
  assert.equal(newSetForDay(51), null);
  assert.throws(() => setsForDay(0), RangeError);
  assert.throws(() => setsForDay(53), RangeError);
});

test('dayCards: 새 세트 먼저, 그다음 복습 세트 오름차순', () => {
  const cards = dayCards(3, sets);
  assert.equal(cards.length, 30);
  assert.ok(cards.slice(0, 10).every((c) => c.word.set === 3 && c.isNew));
  assert.deepEqual(cards.slice(10).map((c) => c.word.set), [...Array(10).fill(1), ...Array(10).fill(2)]);
  assert.ok(cards.slice(10).every((c) => !c.isNew));
  assert.ok(dayCards(52, sets).every((c) => !c.isNew && c.word.set === 50));
});
