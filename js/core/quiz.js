// 4지선다 문제 생성. 핵심 규칙: 한 문제에 정답으로 읽히는 보기는 하나뿐이어야 한다.
import { SYNONYM_GROUPS } from './synonyms.js';

export const QUESTION_TYPES = ['w2m', 'm2w', 'blank'];
const BLANK = '_____';
const LINK_POS = new Set(['prep.', 'conj.', 'phr.']);

// mulberry32: 테스트에서 재현 가능한 난수. 앱에서는 Math.random을 넘긴다.
export function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(arr, rng) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// 전치사·접속사·구·접속부사는 토익 Part 5처럼 한 풀에서 오답을 고른다.
export function poolOf(w) {
  if (LINK_POS.has(w.pos)) return 'link';
  if (w.pos === 'adv.') return w.meaning.includes('(접속부사)') ? 'link' : 'adv';
  return w.pos.replace('.', '');
}

const tokenCache = new WeakMap();
function meaningTokens(w) {
  let tokens = tokenCache.get(w);
  if (!tokens) {
    tokens = new Set(
      w.meaning.replace(/\([^)]*\)/g, '').split(',').map((t) => t.replace(/[~\s]/g, '')).filter(Boolean),
    );
    tokenCache.set(w, tokens);
  }
  return tokens;
}

const groupsByKey = new Map();
SYNONYM_GROUPS.forEach((group, i) => {
  for (const key of group) groupsByKey.set(key, [...(groupsByKey.get(key) ?? []), i]);
});

export function areConfusable(a, b) {
  if (a.key === b.key) return true;
  const ta = meaningTokens(a);
  for (const t of meaningTokens(b)) if (ta.has(t)) return true;
  const ga = groupsByKey.get(a.key) ?? [];
  return (groupsByKey.get(b.key) ?? []).some((g) => ga.includes(g));
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const blankCache = new WeakMap();

// 짝꿍 표현에 표제어가 그대로 있고, 빈칸 말고도 실제 단어가 남을 때만 빈칸 문제를 낸다.
export function blankOf(w) {
  if (blankCache.has(w)) return blankCache.get(w);
  let result = null;
  const m = w.colloc.match(new RegExp(`(^|[^A-Za-z])${escapeRe(w.word)}(?=[^A-Za-z]|$)`, 'i'));
  if (m) {
    const start = m.index + m[1].length;
    const before = w.colloc.slice(0, start);
    const after = w.colloc.slice(start + w.word.length);
    if (/[A-Za-z]{2,}/.test(before + after)) result = before + BLANK + after;
  }
  blankCache.set(w, result);
  return result;
}

export function allowedTypes(w) {
  return blankOf(w) === null ? ['w2m', 'm2w'] : ['w2m', 'm2w', 'blank'];
}

export function buildQuestion(w, type, words, rng) {
  const prompt = type === 'w2m' ? w.word : type === 'm2w' ? w.meaning : blankOf(w);
  if (prompt === null) throw new Error(`빈칸 문제를 낼 수 없는 단어: ${w.word}`);
  const label = (x) => (type === 'w2m' ? x.meaning : x.word);

  const picked = [w];
  const texts = new Set([label(w)]);
  const pool = poolOf(w);
  const candidates = [
    ...shuffle(words.filter((c) => poolOf(c) === pool), rng),
    ...shuffle(words.filter((c) => poolOf(c) !== pool), rng),
  ];
  for (const c of candidates) {
    if (picked.length === 4) break;
    if (texts.has(label(c)) || picked.some((p) => areConfusable(p, c))) continue;
    if (type === 'blank' && blankOf(c) === prompt) continue;
    picked.push(c);
    texts.add(label(c));
  }
  if (picked.length < 4) throw new Error(`오답 보기를 3개 찾지 못함: ${w.word}`);

  const order = shuffle(picked, rng);
  return {
    key: w.key,
    type,
    prompt,
    hint: type === 'blank' ? w.meaning : null,
    options: order.map(label),
    optionKeys: order.map((x) => x.key),
    answerIndex: order.indexOf(w),
  };
}

// 단어당 1문제. 빈칸을 못 쓰는 단어부터 배정해 세 유형이 고르게 섞이게 한다.
export function buildQuiz(targets, words, rng) {
  const order = shuffle(targets, rng);
  const noBlank = order.filter((w) => blankOf(w) === null);
  const withBlank = order.filter((w) => blankOf(w) !== null);
  const counts = { w2m: 0, m2w: 0, blank: 0 };
  const questions = [...noBlank, ...withBlank].map((w) => {
    const types = allowedTypes(w);
    const least = Math.min(...types.map((t) => counts[t]));
    const choices = types.filter((t) => counts[t] === least);
    const type = choices[Math.floor(rng() * choices.length)];
    counts[type]++;
    return buildQuestion(w, type, words, rng);
  });
  return shuffle(questions, rng);
}
