// 단어장: Set 1–50 접이식 목록. 아직 배우지 않은 세트는 흐리게. 검색은 선택 기능.
import { h, icon } from '../dom.js';
import { wordRow } from '../widgets.js';

const pad = (n) => String(n).padStart(2, '0');
const openSets = new Set();
let query = '';
let initialized = false;

function matches(w, q) {
  return w.word.toLowerCase().includes(q) || w.meaning.includes(q) || w.colloc.toLowerCase().includes(q);
}

export function render(ctx) {
  const d = ctx.data;
  // 완료한 학습일의 새 세트까지 + 진행 중인 학습일의 새 세트는 흐리지 않는다.
  let learned = Math.min(d.days.length, 50);
  if (d.session?.day && d.session.day <= 50) learned = Math.max(learned, d.session.day);
  if (!initialized) {
    openSets.add(Math.max(learned, 1));
    initialized = true;
  }

  const list = h('div', { class: 'sets' });

  const draw = () => {
    const q = query.trim().toLowerCase();
    const sections = ctx.vocab.sets.map((words, i) => {
      const set = i + 1;
      const shown = q ? words.filter((w) => matches(w, q)) : words;
      if (q && !shown.length) return null;
      const open = Boolean(q) || openSets.has(set);
      const toggle = () => {
        if (openSets.has(set)) openSets.delete(set);
        else openSets.add(set);
        draw();
      };
      return h('section', { class: `set${set > learned ? ' is-locked' : ''}` },
        h('button', { class: 'set__head', type: 'button', 'aria-expanded': String(open), onClick: q ? null : toggle },
          h('span', { class: 'set__name en' }, `Set ${pad(set)}`),
          h('span', { class: 'set__meta' }, set > learned ? `${shown.length}단어 · 아직 안 배움` : `${shown.length}단어`),
          q ? null : icon('chevronDown')),
        open ? h('ul', { class: 'word-rows' }, shown.map((w) => wordRow(w, { onClick: () => ctx.openWord(w.key), aside: w.pos }))) : null);
    }).filter(Boolean);
    list.replaceChildren(...(sections.length ? sections : [h('p', { class: 'empty' }, `'${query.trim()}'에 맞는 단어가 없어요.`)]));
  };
  draw();

  // 입력할 때마다 목록만 다시 그려서 검색창 포커스를 유지한다.
  const search = h('label', { class: 'search' },
    icon('search'),
    h('input', {
      type: 'search',
      placeholder: '단어나 뜻 검색',
      value: query,
      'aria-label': '단어 검색',
      enterkeyhint: 'search',
      onInput: (e) => {
        query = e.target.value;
        draw();
      },
    }));

  return h('section', { class: 'words' },
    h('h1', { class: 'screen-title' }, '단어장'),
    search,
    list);
}
