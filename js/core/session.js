// 학습일(학습 → 퀴즈 → 결과 → 오답 복습 반복 → 완료)과 오답 연습(퀴즈 → 결과 → 완료)의 상태 머신.
// 모든 함수는 입력을 바꾸지 않고 새 객체를 돌려준다. 세션은 그대로 JSON으로 저장된다.
import { dayCards } from './schedule.js';
import { buildQuiz, shuffle } from './quiz.js';

export const PRACTICE_MAX = 30;

const isQuiz = (s) => s.stage === 'quiz' || s.stage === 'reviewQuiz';

function blank(kind, day, today) {
  return {
    kind, day, stage: 'study',
    cardKeys: [], newKeys: [], cardIndex: 0,
    questions: [], qIndex: 0, answers: [],
    round: 0, firstScore: null, firstMissed: [],
    activeMs: 0, startedOn: today,
  };
}

export function startDaySession(day, vocab, today) {
  const cards = dayCards(day, vocab.sets);
  return {
    ...blank('day', day, today),
    cardKeys: cards.map((c) => c.word.key),
    newKeys: cards.filter((c) => c.isNew).map((c) => c.word.key),
  };
}

export function startPracticeSession(keys, vocab, rng, today) {
  const picked = shuffle(keys.filter((k) => vocab.byKey.has(k)), rng).slice(0, PRACTICE_MAX);
  return beginQuiz({ ...blank('practice', null, today), cardKeys: picked }, vocab, rng);
}

export function setCard(s, index) {
  const cardIndex = Math.min(Math.max(index, 0), Math.max(s.cardKeys.length - 1, 0));
  return cardIndex === s.cardIndex ? s : { ...s, cardIndex };
}

export function beginQuiz(s, vocab, rng) {
  if (s.stage !== 'study' && s.stage !== 'reviewStudy') return s;
  const targets = s.cardKeys.map((k) => vocab.byKey.get(k)).filter(Boolean);
  return {
    ...s,
    stage: s.stage === 'study' ? 'quiz' : 'reviewQuiz',
    questions: buildQuiz(targets, vocab.words, rng),
    qIndex: 0,
    answers: [],
  };
}

export function answerCurrent(s, optionIndex) {
  if (!isQuiz(s) || s.answers.length > s.qIndex) return null;
  const q = s.questions[s.qIndex];
  if (!q) return null;
  const correct = optionIndex === q.answerIndex;
  return { session: { ...s, answers: [...s.answers, { key: q.key, chosen: optionIndex, correct }] }, correct, key: q.key };
}

function endRound(s) {
  const missed = s.answers.filter((a) => !a.correct).map((a) => a.key);
  if (s.kind === 'practice' || s.round === 0) {
    return {
      ...s,
      stage: 'result',
      firstScore: { correct: s.answers.length - missed.length, total: s.answers.length },
      firstMissed: missed,
    };
  }
  if (missed.length === 0) return { ...s, stage: 'done' };
  return { ...s, stage: 'reviewStudy', cardKeys: missed, cardIndex: 0, questions: [], qIndex: 0, answers: [], round: s.round + 1 };
}

export function nextQuestion(s) {
  if (!isQuiz(s) || s.answers.length <= s.qIndex) return s;
  if (s.qIndex + 1 < s.questions.length) return { ...s, qIndex: s.qIndex + 1 };
  return endRound(s);
}

export function leaveResult(s) {
  if (s.stage !== 'result') return s;
  if (s.kind === 'practice' || s.firstMissed.length === 0) return { ...s, stage: 'done' };
  return {
    ...s,
    stage: 'reviewStudy',
    cardKeys: [...s.firstMissed],
    cardIndex: 0,
    questions: [],
    qIndex: 0,
    answers: [],
    round: 1,
  };
}

export function addActiveTime(s, ms) {
  return { ...s, activeMs: s.activeMs + Math.max(0, ms) };
}

// md를 고쳐 단어가 사라졌을 때: 그 단어의 카드와 문제만 빼고 나머지 진행은 그대로 둔다.
// 오답 보기로만 쓰인 단어는 보기 텍스트가 문제에 저장돼 있으므로 건드리지 않는다.
export function reconcileSession(s, byKey) {
  if (!s) return s;
  const has = (k) => byKey.has(k);
  const keep = s.questions.map((q) => has(q.key));
  const cardKeys = s.cardKeys.filter(has);
  const next = {
    ...s,
    cardKeys,
    newKeys: s.newKeys.filter(has),
    firstMissed: s.firstMissed.filter(has),
    cardIndex: Math.min(s.cardIndex, Math.max(cardKeys.length - 1, 0)),
    questions: s.questions.filter((_, i) => keep[i]),
    answers: s.answers.filter((_, i) => keep[i]),
    qIndex: keep.slice(0, s.qIndex).filter(Boolean).length,
  };
  // 남은 문제를 이미 다 풀었으면 라운드를 마무리한다.
  if (isQuiz(next) && next.questions.length > 0 && next.qIndex >= next.questions.length) return endRound(next);
  return next;
}
