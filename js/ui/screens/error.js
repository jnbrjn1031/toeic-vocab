import { h } from '../dom.js';

export function render({ title, problems = [], message, onRetry }) {
  return h('section', { class: 'error-screen' },
    h('h1', null, title),
    message ? h('p', { class: 'muted' }, message) : null,
    problems.length ? h('ul', null, problems.map((p) => h('li', null, p))) : null,
    onRetry ? h('button', { class: 'btn btn--primary btn--block', type: 'button', onClick: onRetry }, '다시 시도') : null);
}
