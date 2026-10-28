// 여러 화면이 함께 쓰는 동작: 학습일 시작/이어하기, 오답 연습 시작/이어하기.
// 잠금 판단은 항상 누르는 순간의 날짜(ctx.today())로 다시 한다.
import { canStartNextDay } from '../core/progress.js';
import { startDaySession, startPracticeSession } from '../core/session.js';
import { missedList } from '../core/records.js';

export function canStartDay(ctx) {
  const d = ctx.data;
  return canStartNextDay({
    completedDays: d.days.length,
    lastDate: d.days.at(-1)?.date ?? null,
    today: ctx.today(),
    allowMultiple: d.settings.allowMultiplePerDay,
  });
}

export function startOrResumeDay(ctx) {
  if (!ctx.data.session) {
    if (!canStartDay(ctx)) {
      ctx.toast('오늘 학습은 이미 끝냈어요. 다음 학습은 내일 열려요.');
      ctx.go('#/home');
      return;
    }
    ctx.update((x) => ({ ...x, session: startDaySession(x.days.length + 1, ctx.vocab, ctx.today()) }), { render: false });
  }
  ctx.go('#/session');
}

export function practiceKeys(ctx) {
  return missedList(ctx.data).map((x) => x.key).filter((k) => ctx.vocab.byKey.has(k));
}

export function startOrResumePractice(ctx) {
  if (!ctx.data.practice) {
    const keys = practiceKeys(ctx);
    if (!keys.length) {
      ctx.toast('아직 틀린 단어가 없어요');
      return;
    }
    ctx.update((x) => ({ ...x, practice: startPracticeSession(keys, ctx.vocab, Math.random, ctx.today()) }), { render: false });
  }
  ctx.go('#/practice');
}
