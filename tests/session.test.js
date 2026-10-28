import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseVocab } from '../js/core/parser.js';
import { makeRng } from '../js/core/quiz.js';
import { startDaySession, startPracticeSession, setCard, beginQuiz, answerCurrent, nextQuestion, leaveResult,
  addActiveTime, reconcileSession } from '../js/core/session.js';

const parsed = parseVocab(readFileSync(new URL('../toeic-vocab-500.md', import.meta.url), 'utf8'));
const vocab = { ...parsed, byKey: new Map(parsed.words.map((w) => [w.key, w])) };
const D = '2026-10-29';
const right = (s) => s.questions[s.qIndex].answerIndex;
const wrong = (s) => (right(s) + 1) % 4;
const play = (s, pick) => { while (s.stage === 'quiz' || s.stage === 'reviewQuiz') { s = answerCurrent(s, pick(s)).session; s = nextQuestion(s); } return s; };

test('1일차 시작', () => {
  const s = startDaySession(1, vocab, D);
  assert.equal(s.stage, 'study');
  assert.equal(s.cardKeys.length, 10);
  assert.deepEqual(s.newKeys, s.cardKeys);
  assert.equal(setCard(s, 99).cardIndex, 9);
});

test('전부 맞히면 result → done, 복습 0회', () => {
  let s = beginQuiz(startDaySession(1, vocab, D), vocab, makeRng(1));
  assert.equal(s.stage, 'quiz');
  s = play(s, right);
  assert.equal(s.stage, 'result');
  assert.deepEqual(s.firstScore, { correct: 10, total: 10 });
  s = leaveResult(s);
  assert.equal(s.stage, 'done');
  assert.equal(s.round, 0);
});

test('틀린 단어만 복습, 또 틀리면 반복, 다 맞으면 done', () => {
  let s = beginQuiz(startDaySession(1, vocab, D), vocab, makeRng(2));
  let n = 0;
  s = play(s, (x) => (n++ < 2 ? wrong(x) : right(x)));
  assert.deepEqual(s.firstScore, { correct: 8, total: 10 });
  const missed = s.firstMissed;
  assert.equal(missed.length, 2);
  s = leaveResult(s);
  assert.equal(s.stage, 'reviewStudy');
  assert.deepEqual(s.cardKeys, missed);
  assert.equal(s.round, 1);
  s = beginQuiz(s, vocab, makeRng(3));
  assert.equal(s.stage, 'reviewQuiz');
  assert.equal(s.questions.length, 2);
  let m = 0;
  s = play(s, (x) => (m++ === 0 ? wrong(x) : right(x)));
  assert.equal(s.stage, 'reviewStudy');
  assert.equal(s.cardKeys.length, 1);
  assert.equal(s.round, 2);
  s = play(beginQuiz(s, vocab, makeRng(4)), right);
  assert.equal(s.stage, 'done');
  assert.equal(s.round, 2);
  assert.deepEqual(s.firstScore, { correct: 8, total: 10 });
});

test('이미 답한 문제를 다시 누르면 무시', () => {
  const s = beginQuiz(startDaySession(1, vocab, D), vocab, makeRng(5));
  const r = answerCurrent(s, wrong(s));
  assert.equal(r.correct, false);
  assert.equal(answerCurrent(r.session, right(r.session)), null);
  assert.equal(r.session.answers.length, 1);
});

test('답하기 전 nextQuestion은 아무것도 안 함', () => {
  const s = beginQuiz(startDaySession(1, vocab, D), vocab, makeRng(6));
  assert.equal(nextQuestion(s), s);
});

test('JSON 왕복 후 이어서 진행', () => {
  let s = beginQuiz(startDaySession(1, vocab, D), vocab, makeRng(7));
  s = nextQuestion(answerCurrent(s, right(s)).session);
  const r = JSON.parse(JSON.stringify(s));
  assert.deepEqual(r, s);
  assert.equal(r.qIndex, 1);
  assert.equal(play(r, right).stage, 'result');
});

test('reconcileSession: md에서 사라진 단어만 건너뜀', () => {
  let s = beginQuiz(startDaySession(1, vocab, D), vocab, makeRng(8));
  const firstKey = s.questions[0].key;
  s = nextQuestion(answerCurrent(s, right(s)).session); // 1번 답함, qIndex 1
  const byKey = new Map(vocab.byKey); byKey.delete(firstKey);
  const r = reconcileSession(s, byKey);
  assert.equal(r.questions.length, 9);
  assert.equal(r.answers.length, 0);
  assert.equal(r.qIndex, 0);
  assert.ok(!r.cardKeys.includes(firstKey));
});

test('reconcileSession: 남은 문제를 다 풀었으면 라운드 마무리', () => {
  let s = beginQuiz(startDaySession(1, vocab, D), vocab, makeRng(10));
  for (let i = 0; i < 9; i++) s = nextQuestion(answerCurrent(s, right(s)).session); // qIndex 9, 마지막 문제 미답
  const byKey = new Map(vocab.byKey); byKey.delete(s.questions[9].key);
  const r = reconcileSession(s, byKey);
  assert.equal(r.stage, 'result');
  assert.deepEqual(r.firstScore, { correct: 9, total: 9 });
});

test('오답 연습: 최대 30개, 퀴즈 → result → done', () => {
  const keys = parsed.words.slice(0, 40).map((w) => w.key);
  let p = startPracticeSession(keys, vocab, makeRng(9), '2026-10-30');
  assert.equal(p.kind, 'practice');
  assert.equal(p.stage, 'quiz');
  assert.equal(p.questions.length, 30);
  p = play(p, wrong);
  assert.equal(p.stage, 'result');
  assert.equal(leaveResult(p).stage, 'done');
});

test('addActiveTime 누적', () => {
  const s = addActiveTime(addActiveTime(startDaySession(1, vocab, D), 1000), 500);
  assert.equal(s.activeMs, 1500);
});
