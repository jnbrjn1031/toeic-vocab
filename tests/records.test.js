import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseVocab } from '../js/core/parser.js';
import { makeRng } from '../js/core/quiz.js';
import { startDaySession, startPracticeSession, beginQuiz } from '../js/core/session.js';
import { DEFAULT_SETTINGS, defaultData, recordAnswer, applyAnswer, finishDay, missedList, migrate, serialize, deserialize }
  from '../js/core/records.js';

const parsed = parseVocab(readFileSync(new URL('../toeic-vocab-500.md', import.meta.url), 'utf8'));
const vocab = { ...parsed, byKey: new Map(parsed.words.map((w) => [w.key, w])) };

test('기본값', () => {
  const d = defaultData();
  assert.equal(d.schemaVersion, 1);
  assert.deepEqual(d.settings, { theme: 'system', startDate: '2026-10-29', exams: ['2026-12-13', '2026-12-27'], allowMultiplePerDay: false });
  assert.deepEqual(d.days, []);
  assert.deepEqual(d.wordStats, {});
  assert.equal(d.session, null);
  assert.equal(d.practice, null);
});

test('recordAnswer 누적', () => {
  let d = recordAnswer(defaultData(), 'submit', false, '2026-10-29');
  d = recordAnswer(d, 'submit', true, '2026-10-30');
  assert.deepEqual(d.wordStats.submit, { quizzed: 2, missed: 1, lastMissed: '2026-10-29' });
});

test('applyAnswer: 학습일은 기록, 연습은 기록 안 함', () => {
  const s = beginQuiz(startDaySession(1, vocab, '2026-10-29'), vocab, makeRng(1));
  const d1 = applyAnswer({ ...defaultData(), session: s }, 'session', s.questions[0].answerIndex, '2026-10-29');
  assert.equal(d1.wordStats[s.questions[0].key].quizzed, 1);
  assert.equal(applyAnswer(d1, 'session', 0, '2026-10-29'), d1); // 이미 답함
  const p = startPracticeSession(['submit', 'comply'], vocab, makeRng(2), '2026-10-30');
  const d2 = applyAnswer({ ...defaultData(), practice: p }, 'practice', 0, '2026-10-30');
  assert.deepEqual(d2.wordStats, {});
  assert.equal(d2.practice.answers.length, 1);
  assert.deepEqual(d2.days, []);
});

test('finishDay: 하루 기록 추가', () => {
  const done = { ...startDaySession(1, vocab, '2026-10-29'), stage: 'done', firstScore: { correct: 8, total: 10 },
    firstMissed: ['submit', 'comply'], round: 1, activeMs: 600000 };
  const d = finishDay({ ...defaultData(), session: done }, '2026-10-30');
  assert.deepEqual(d.days, [{ day: 1, date: '2026-10-30', sets: [1], firstScore: { correct: 8, total: 10 },
    missed: ['submit', 'comply'], reviewRounds: 1, activeMs: 600000 }]);
  assert.equal(d.session, null);
});

test('finishDay: 순서가 안 맞거나 안 끝난 세션은 거부', () => {
  const day2 = { ...startDaySession(2, vocab, '2026-10-29'), stage: 'done', firstScore: { correct: 1, total: 1 } };
  assert.throws(() => finishDay({ ...defaultData(), session: day2 }, '2026-10-29'));
  assert.throws(() => finishDay({ ...defaultData(), session: startDaySession(1, vocab, '2026-10-29') }, '2026-10-29'));
});

test('missedList: 틀린 횟수순, 같으면 최근 순', () => {
  let d = defaultData();
  d = recordAnswer(d, 'a', false, '2026-10-29');
  d = recordAnswer(d, 'b', false, '2026-10-29');
  d = recordAnswer(d, 'b', false, '2026-10-30');
  d = recordAnswer(d, 'c', false, '2026-10-31');
  d = recordAnswer(d, 'e', true, '2026-10-31');
  assert.deepEqual(missedList(d).map((x) => x.key), ['b', 'c', 'a']);
});

test('백업 왕복', () => {
  const d = recordAnswer(defaultData(), 'submit', false, '2026-10-29');
  assert.deepEqual(deserialize(serialize(d)), d);
});

test('잘못된 백업은 한국어 에러', () => {
  assert.throws(() => deserialize('not json'), /백업 파일/);
  assert.throws(() => deserialize('{"foo":1}'), /백업 파일/);
  assert.throws(() => deserialize(JSON.stringify({ ...defaultData(), schemaVersion: 99 })), /새 버전/);
});

test('migrate가 빠진 필드를 채움', () => {
  const d = migrate({ schemaVersion: 1, days: [] });
  assert.deepEqual(d.settings, DEFAULT_SETTINGS);
  assert.deepEqual(d.wordStats, {});
  assert.equal(d.session, null);
});
