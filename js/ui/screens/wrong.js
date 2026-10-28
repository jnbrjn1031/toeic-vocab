// 오답노트: 한 번이라도 틀린 단어를 많이 틀린 순으로. 진도와 무관한 "오답만 퀴즈" 연습.
import { h } from '../dom.js';
import { wordRow } from '../widgets.js';
import { missedList } from '../../core/records.js';
import { startOrResumePractice } from '../actions.js';

export function render(ctx) {
  const list = missedList(ctx.data).filter((x) => ctx.vocab.byKey.has(x.key));
  const resuming = Boolean(ctx.data.practice);

  return h('section', { class: 'wrong' },
    h('h1', { class: 'screen-title' }, '오답노트'),
    h('div', { class: 'wrong__intro' },
      h('p', { class: 'muted' }, list.length ? `틀린 단어 ${list.length}개, 많이 틀린 순이에요.` : '아직 틀린 단어가 없어요. 퀴즈에서 틀린 단어가 여기에 모여요.'),
      h('button', {
        class: 'btn btn--primary btn--block',
        type: 'button',
        disabled: !list.length && !resuming,
        onClick: () => startOrResumePractice(ctx),
      }, resuming ? '오답 연습 이어하기' : '오답만 퀴즈'),
      h('p', { class: 'wrong__hint' }, '오답만 퀴즈는 연습이라 학습 진도와 기록에 반영되지 않아요.')),
    list.length
      ? h('ul', { class: 'word-rows' }, list.map((x) => {
          const w = ctx.vocab.byKey.get(x.key);
          return wordRow(w, { onClick: () => ctx.openWord(w.key), aside: `${x.missed}번 틀림` });
        }))
      : null);
}
