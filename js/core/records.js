// 앱 데이터(Data) 모델: 설정, 하루 기록, 단어별 누적 기록, 진행 중 세션.
// 완료한 학습일 수는 days.length, 마지막 완료 날짜는 days.at(-1)?.date로 센다.
import { answerCurrent } from './session.js';
import { setsForDay } from './schedule.js';

export const SCHEMA_VERSION = 1;
export const DEFAULT_SETTINGS = {
  theme: 'system',
  startDate: '2026-10-29',
  exams: ['2026-12-13', '2026-12-27'],
  allowMultiplePerDay: false,
};

export function defaultData() {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: { ...DEFAULT_SETTINGS, exams: [...DEFAULT_SETTINGS.exams] },
    days: [],
    wordStats: {},
    session: null,
    practice: null,
  };
}

export function recordAnswer(data, key, correct, today) {
  const prev = data.wordStats[key] ?? { quizzed: 0, missed: 0, lastMissed: null };
  const next = {
    quizzed: prev.quizzed + 1,
    missed: prev.missed + (correct ? 0 : 1),
    lastMissed: correct ? prev.lastMissed : today,
  };
  return { ...data, wordStats: { ...data.wordStats, [key]: next } };
}

// 오답 연습(practice)은 진도에도 단어별 기록에도 영향을 주지 않는다.
export function applyAnswer(data, slot, optionIndex, today) {
  const r = data[slot] && answerCurrent(data[slot], optionIndex);
  if (!r) return data;
  const next = { ...data, [slot]: r.session };
  return slot === 'session' ? recordAnswer(next, r.key, r.correct, today) : next;
}

export function finishDay(data, today) {
  const s = data.session;
  if (!s || s.kind !== 'day' || s.stage !== 'done' || s.day !== data.days.length + 1) {
    throw new Error('완료할 수 없는 학습일 세션이에요.');
  }
  const record = {
    day: s.day,
    date: today,
    sets: setsForDay(s.day),
    firstScore: s.firstScore,
    missed: s.firstMissed,
    reviewRounds: s.round,
    activeMs: s.activeMs,
  };
  return { ...data, days: [...data.days, record], session: null };
}

export function missedList(data) {
  return Object.entries(data.wordStats)
    .filter(([, s]) => s.missed > 0)
    .map(([key, s]) => ({ key, ...s }))
    .sort((a, b) => b.missed - a.missed || (b.lastMissed ?? '').localeCompare(a.lastMissed ?? ''));
}

export function migrate(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !Number.isInteger(raw.schemaVersion) || !Array.isArray(raw.days)) {
    throw new Error('백업 파일 형식이 아니에요.');
  }
  if (raw.schemaVersion > SCHEMA_VERSION) throw new Error('새 버전 앱에서 만든 백업이에요. 앱을 업데이트해 주세요.');
  const base = defaultData();
  return {
    ...base,
    ...raw,
    schemaVersion: SCHEMA_VERSION,
    settings: { ...base.settings, ...(raw.settings ?? {}) },
    wordStats: raw.wordStats ?? {},
    session: raw.session ?? null,
    practice: raw.practice ?? null,
  };
}

export function serialize(data) {
  return JSON.stringify(data, null, 2);
}

export function deserialize(text) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('백업 파일 형식이 아니에요.');
  }
  return migrate(raw);
}
