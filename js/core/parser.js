// toeic-vocab-500.md의 "## Set NN" 표를 읽어 단어 목록을 만든다.

export const POS = ['v.', 'n.', 'adj.', 'adv.', 'prep.', 'conj.', 'phr.'];
const SET_COUNT = 50;
const PER_SET = 10;

export class VocabError extends Error {
  constructor(problems) {
    super(problems.join('\n'));
    this.name = 'VocabError';
    this.problems = problems;
  }
}

const pad = (n) => String(n).padStart(2, '0');

export function parseVocab(md) {
  const lines = md.replace(/^﻿/, '').split(/\r?\n/);
  const problems = [];
  const bySet = new Map();
  let current = null;

  for (const line of lines) {
    const heading = line.match(/^##\s*Set\s+(\d+)\s*$/);
    if (heading) {
      current = Number(heading[1]);
      if (!bySet.has(current)) bySet.set(current, []);
      continue;
    }
    if (current === null || !line.trim().startsWith('|')) continue;

    const cells = line.trim().split('|').map((c) => c.trim());
    if (cells[0] === '') cells.shift();
    if (cells.at(-1) === '') cells.pop();
    if (!/^\d+$/.test(cells[0] ?? '')) continue; // 헤더, 구분선

    if (cells.length !== 5) {
      problems.push(`Set ${pad(current)} No ${cells[0]}: 칸이 ${cells.length}개 (5개여야 함)`);
      continue;
    }
    const [no, word, pos, meaning, colloc] = cells;
    if (!POS.includes(pos)) problems.push(`No ${no}: 알 수 없는 품사 '${pos}'`);
    bySet.get(current).push({ no: Number(no), set: current, word, pos, meaning, colloc, key: word.toLowerCase() });
  }

  const setNumbers = [...bySet.keys()].sort((a, b) => a - b);
  if (setNumbers.length !== SET_COUNT) problems.push(`세트 ${setNumbers.length}개 (${SET_COUNT}개여야 함)`);
  for (let s = 1; s <= SET_COUNT; s++) {
    if (!bySet.has(s)) problems.push(`Set ${pad(s)}: 없음`);
  }
  for (const s of setNumbers) {
    const n = bySet.get(s).length;
    if (n !== PER_SET) problems.push(`Set ${pad(s)}: 단어 ${n}개 (${PER_SET}개여야 함)`);
  }

  const sets = setNumbers.map((s) => bySet.get(s));
  const words = sets.flat().sort((a, b) => a.no - b.no);
  if (words.length !== SET_COUNT * PER_SET) problems.push(`전체 ${words.length}단어 (${SET_COUNT * PER_SET}개여야 함)`);

  const seen = new Set();
  for (const w of words) {
    if (seen.has(w.key)) problems.push(`중복 단어: ${w.word}`);
    seen.add(w.key);
  }

  if (problems.length) throw new VocabError(problems);
  return { words, sets };
}
