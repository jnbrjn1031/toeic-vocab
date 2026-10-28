import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseVocab } from '../js/core/parser.js';
import { dayCards } from '../js/core/schedule.js';
import { makeRng, poolOf, areConfusable, blankOf, allowedTypes, buildQuestion, buildQuiz } from '../js/core/quiz.js';

const { words, sets } = parseVocab(readFileSync(new URL('../toeic-vocab-500.md', import.meta.url), 'utf8'));
const byKey = new Map(words.map((w) => [w.key, w]));
const W = (k) => byKey.get(k);

test('blankOf: 표제어가 그대로 있고 실제 단어가 남을 때만', () => {
  assert.equal(blankOf(W('submit')), '_____ an application');
  assert.equal(blankOf(W('eligible')), 'be _____ for');
  assert.equal(blankOf(W('due to')), '_____ bad weather');
  assert.equal(blankOf(W('although')), '_____ sales rose, ~');
  assert.equal(blankOf(W('by')), 'submit _____ Friday');
  assert.equal(blankOf(W('promote')), null);   // be promoted to manager
  assert.equal(blankOf(W('enclose')), null);   // Enclosed is ~
  assert.equal(blankOf(W('applicant')), null); // qualified applicants
  assert.equal(blankOf(W('however')), null);   // However, ~
  assert.equal(blankOf(W('whereas')), null);   // whereas B ~
  assert.equal(blankOf(W('therefore')), null); // ~; therefore, ~
});

test('poolOf: 전치사·접속사·구·접속부사는 한 풀', () => {
  assert.equal(poolOf(W('submit')), 'v');
  assert.equal(poolOf(W('deadline')), 'n');
  assert.equal(poolOf(W('eligible')), 'adj');
  assert.equal(poolOf(W('promptly')), 'adv');
  for (const k of ['however', 'despite', 'although', 'in order to', 'instead']) assert.equal(poolOf(W(k)), 'link', k);
});

test('areConfusable', () => {
  for (const [a, b] of [['due to', 'because of'], ['owing to', 'due to'], ['confirm', 'verify'], ['upon', 'as soon as'],
    ['until', 'by'], ['instead of', 'instead'], ['although', 'even though'], ['attend', 'participate']]) {
    assert.ok(areConfusable(W(a), W(b)), `${a} ~ ${b}`);
  }
  assert.ok(!areConfusable(W('despite'), W('nevertheless')));
  assert.ok(!areConfusable(W('submit'), W('comply')));
});

test('모든 단어·가능한 유형·여러 시드: 정답은 하나뿐', () => {
  for (let seed = 1; seed <= 5; seed++) {
    const rng = makeRng(seed);
    for (const w of words) for (const type of allowedTypes(w)) {
      const q = buildQuestion(w, type, words, rng);
      assert.equal(q.options.length, 4);
      assert.equal(new Set(q.options).size, 4);
      assert.equal(q.optionKeys[q.answerIndex], w.key);
      const others = q.optionKeys.filter((k) => k !== w.key).map(W);
      const all = [w, ...others];
      for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
        assert.ok(!areConfusable(all[i], all[j]), `${type} ${all[i].key} / ${all[j].key}`);
      }
      if (type === 'blank') {
        assert.equal(q.hint, w.meaning);
        for (const o of others) assert.notEqual(blankOf(o), q.prompt);
      } else assert.equal(q.hint, null);
    }
  }
});

test('같은 풀에서 오답을 고름', () => {
  const rng = makeRng(7);
  for (const k of ['despite', 'submit', 'promptly', 'eligible', 'deadline']) {
    const q = buildQuestion(W(k), 'm2w', words, rng);
    assert.ok(q.optionKeys.every((x) => poolOf(W(x)) === poolOf(W(k))), k);
  }
});

test('buildQuiz: 3일차 30문제, 단어당 1문제, 세 유형이 고르게', () => {
  const targets = dayCards(3, sets).map((c) => c.word);
  for (let seed = 1; seed <= 10; seed++) {
    const qs = buildQuiz(targets, words, makeRng(seed));
    assert.equal(qs.length, 30);
    assert.deepEqual(new Set(qs.map((q) => q.key)), new Set(targets.map((w) => w.key)));
    for (const t of ['w2m', 'm2w', 'blank']) assert.ok(qs.filter((q) => q.type === t).length >= 8, `seed ${seed} ${t}`);
  }
});
