import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseVocab, VocabError } from '../js/core/parser.js';

const md = readFileSync(new URL('../toeic-vocab-500.md', import.meta.url), 'utf8');

test('실제 md: 500단어, 50세트, 세트당 10개', () => {
  const { words, sets } = parseVocab(md);
  assert.equal(words.length, 500);
  assert.equal(sets.length, 50);
  assert.ok(sets.every((s) => s.length === 10));
});

test('필드 파싱', () => {
  const { words, sets } = parseVocab(md);
  assert.deepEqual(words[0], { no: 1, set: 1, word: 'submit', pos: 'v.', meaning: '제출하다', colloc: 'submit an application', key: 'submit' });
  assert.equal(words[9].meaning, '~에도 불구하고 (뒤에 명사)');
  assert.equal(words.find((w) => w.key === 'due to').set, 3);
  assert.equal(sets[49][9].word, 'instead');
});

test('학습 구조 표는 단어로 읽지 않음', () => {
  assert.ok(!parseVocab(md).words.some((w) => w.word.includes('일차')));
});

test('CRLF·BOM이 있어도 같은 결과', () => {
  const crlf = '﻿' + md.replace(/\n/g, '\r\n');
  assert.deepEqual(parseVocab(crlf).words, parseVocab(md).words);
});

test('한 행이 빠지면 VocabError (세트와 총수 명시)', () => {
  const broken = md.replace(/^\| 500 \|.*\n/m, '');
  assert.throws(() => parseVocab(broken), (e) =>
    e instanceof VocabError && e.problems.some((p) => p.includes('Set 50')) && e.problems.some((p) => p.includes('499')));
});

test('표제어가 중복되면 VocabError', () => {
  const dup = md.replace('| 2 | comply |', '| 2 | submit |');
  assert.throws(() => parseVocab(dup), (e) => e instanceof VocabError && e.problems.some((p) => p.includes('submit')));
});

test('모르는 품사면 VocabError', () => {
  const bad = md.replace('| 1 | submit | v. |', '| 1 | submit | verb |');
  assert.throws(() => parseVocab(bad), VocabError);
});
