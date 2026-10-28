import { test } from 'node:test';
import assert from 'node:assert/strict';
import { daysBehind, streak, canStartNextDay, learnedCount, ddayLabel } from '../js/core/progress.js';

test('계획 대비 밀린 일수', () => {
  const s = '2026-10-29';
  assert.equal(daysBehind(s, '2026-10-28', 0), 0);
  assert.equal(daysBehind(s, '2026-10-29', 0), 0);
  assert.equal(daysBehind(s, '2026-10-30', 0), 1);
  assert.equal(daysBehind(s, '2026-10-30', 1), 0);
  assert.equal(daysBehind(s, '2026-10-30', 3), 0);
  assert.equal(daysBehind(s, '2026-12-20', 51), 1);
  assert.equal(daysBehind(s, '2027-01-31', 52), 0);
});

test('스트릭', () => {
  assert.equal(streak([], '2026-10-29'), 0);
  assert.equal(streak(['2026-10-29'], '2026-10-29'), 1);
  assert.equal(streak(['2026-10-29', '2026-10-30'], '2026-10-31'), 2);
  assert.equal(streak(['2026-10-29'], '2026-10-31'), 0);
  assert.equal(streak(['2026-10-29', '2026-10-29', '2026-10-30'], '2026-10-30'), 2);
  assert.equal(streak(['2026-10-27', '2026-10-29', '2026-10-30'], '2026-10-30'), 2);
});

test('다음 학습일 열림 (누르는 시점의 날짜 기준)', () => {
  const base = { completedDays: 1, lastDate: '2026-10-29', allowMultiple: false };
  assert.equal(canStartNextDay({ completedDays: 0, lastDate: null, today: '2026-10-29', allowMultiple: false }), true);
  assert.equal(canStartNextDay({ ...base, today: '2026-10-29' }), false);
  assert.equal(canStartNextDay({ ...base, today: '2026-10-30' }), true);
  assert.equal(canStartNextDay({ ...base, today: '2026-10-29', allowMultiple: true }), true);
  assert.equal(canStartNextDay({ completedDays: 52, lastDate: '2026-12-19', today: '2026-12-25', allowMultiple: true }), false);
});

test('학습한 단어 수', () => {
  assert.equal(learnedCount(0), 0);
  assert.equal(learnedCount(1), 10);
  assert.equal(learnedCount(50), 500);
  assert.equal(learnedCount(52), 500);
});

test('D-day 표시', () => {
  assert.equal(ddayLabel('2026-12-13', '2026-10-29'), 'D-45');
  assert.equal(ddayLabel('2026-12-13', '2026-12-13'), 'D-Day');
  assert.equal(ddayLabel('2026-12-13', '2026-12-14'), '종료');
});
