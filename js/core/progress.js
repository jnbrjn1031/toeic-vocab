import { addDays, diffDays } from './dates.js';
import { TOTAL_DAYS, TOTAL_SETS } from './schedule.js';

// 오늘 분량은 아직 안 했어도 밀림으로 치지 않는다.
export function daysBehind(startDate, today, completedDays) {
  const due = Math.min(Math.max(diffDays(startDate, today), 0), TOTAL_DAYS);
  return Math.max(0, due - completedDays);
}

// 오늘 아직 안 했으면 어제까지 이어진 스트릭을 그대로 보여준다.
export function streak(completionDates, today) {
  const dates = new Set(completionDates);
  let cursor = dates.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (dates.has(cursor)) {
    count++;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export function canStartNextDay({ completedDays, lastDate, today, allowMultiple }) {
  return completedDays < TOTAL_DAYS && (allowMultiple || lastDate !== today);
}

export function learnedCount(completedDays) {
  return Math.min(completedDays, TOTAL_SETS) * 10;
}

export function ddayLabel(examDate, today) {
  const left = diffDays(today, examDate);
  if (left > 0) return `D-${left}`;
  return left === 0 ? 'D-Day' : '종료';
}
