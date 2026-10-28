// 3세트 슬라이딩 일정: d일차 학습 세트 = max(1, d-2) ~ min(50, d), 총 52일.

export const TOTAL_DAYS = 52;
export const TOTAL_SETS = 50;

export function setsForDay(d) {
  if (!Number.isInteger(d) || d < 1 || d > TOTAL_DAYS) throw new RangeError(`학습일은 1~${TOTAL_DAYS}: ${d}`);
  const sets = [];
  for (let s = Math.max(1, d - 2); s <= Math.min(TOTAL_SETS, d); s++) sets.push(s);
  return sets;
}

export function newSetForDay(d) {
  return d <= TOTAL_SETS ? d : null;
}

// 새 세트 먼저, 그다음 복습 세트를 번호 오름차순으로. 세트 안에서는 no 순.
export function dayCards(d, sets) {
  const newSet = newSetForDay(d);
  const order = setsForDay(d).sort((a, b) => (a === newSet ? -1 : b === newSet ? 1 : a - b));
  return order.flatMap((s) => sets[s - 1].map((word) => ({ word, isNew: s === newSet })));
}
