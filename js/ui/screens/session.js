import { h } from '../dom.js';

export function render(ctx, slot) {
  return h('section', null, h('h1', { class: 'screen-title' }, slot === 'session' ? '학습' : '오답 연습'));
}
