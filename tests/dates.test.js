process.env.TZ = 'Asia/Seoul';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toDateStr, diffDays, addDays, formatMonthDay } from '../js/core/dates.js';

test('KST 오전 9시 전에도 로컬 날짜', () => {
  const d = new Date('2026-10-28T23:30:00Z'); // KST 10/29 08:30
  assert.equal(d.getHours(), 8, 'TZ 설정 전제 확인');
  assert.equal(toDateStr(d), '2026-10-29');
});

test('diffDays / addDays', () => {
  assert.equal(diffDays('2026-10-29', '2026-12-13'), 45);
  assert.equal(diffDays('2026-12-13', '2026-10-29'), -45);
  assert.equal(addDays('2026-10-29', 45), '2026-12-13');
  assert.equal(addDays('2026-10-29', 51), '2026-12-19');
});

test('formatMonthDay', () => {
  assert.equal(formatMonthDay('2026-12-13'), '12/13(일)');
});
