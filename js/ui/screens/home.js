import { h } from '../dom.js';
import { canStartNextDay } from '../../core/progress.js';
import { startDaySession } from '../../core/session.js';

// 임시 홈: 시작/이어하기 버튼만 있다. Task 8에서 전체 홈으로 바뀐다.
export function render(ctx) {
  const d = ctx.data;
  const open = () => canStartNextDay({
    completedDays: d.days.length,
    lastDate: d.days.at(-1)?.date ?? null,
    today: ctx.today(),
    allowMultiple: d.settings.allowMultiplePerDay,
  });
  const start = () => {
    if (!ctx.data.session && !open()) return ctx.toast('오늘 학습은 이미 끝냈어요');
    if (!ctx.data.session) {
      ctx.update((x) => ({ ...x, session: startDaySession(x.days.length + 1, ctx.vocab, ctx.today()) }), { render: false });
    }
    ctx.go('#/session');
  };
  const label = d.session ? '이어하기' : open() ? `${d.days.length + 1}일차 시작` : '오늘 학습 완료';
  return h('section', null,
    h('h1', { class: 'screen-title' }, '홈'),
    h('button', { class: 'btn btn--primary btn--block btn--lg', type: 'button', disabled: !d.session && !open(), onClick: start }, label));
}
