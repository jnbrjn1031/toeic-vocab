import { h } from '../dom.js';

export function render(ctx) {
  return h('section', null, h('h1', { class: 'screen-title' }, '설정'));
}
