// 여러 화면이 함께 쓰는 위젯: 단어 카드, 진행 링, 시트, 확인 시트, 토스트.
import { h, icon, canSpeak, speak } from './dom.js';

const BADGE_CLASS = { NEW: 'badge--new', 복습: 'badge--review', 오답: 'badge--wrong' };

// 짝꿍 표현 속 표제어(활용형 포함)를 강조한다. 텍스트 노드로만 만들어 HTML 주입이 없다.
function collocNodes(word) {
  const esc = word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = word.colloc.match(new RegExp(`(^|[^A-Za-z])(${esc}[A-Za-z]*)`, 'i'));
  if (!m) return [word.colloc];
  const start = m.index + m[1].length;
  const end = start + m[2].length;
  return [word.colloc.slice(0, start), h('mark', null, word.colloc.slice(start, end)), word.colloc.slice(end)];
}

export function wordCard(word, { badge = null } = {}) {
  const speakBtn = canSpeak()
    ? h('button', {
        class: 'icon-btn',
        type: 'button',
        'aria-label': '발음 듣기',
        onClick: (e) => { e.stopPropagation(); speak(word.word); },
      }, icon('speaker'))
    : null;

  const card = h('div', { class: 'flashcard', role: 'button', tabindex: '0', 'aria-label': `${word.word} 카드, 탭해서 뒤집기` },
    h('div', { class: 'flashcard__inner' },
      h('div', { class: 'flashcard__face flashcard__front' },
        h('div', { class: 'flashcard__top' },
          badge ? h('span', { class: `badge ${BADGE_CLASS[badge]}` }, badge) : h('span'),
          speakBtn),
        h('div', { class: 'flashcard__body' },
          h('div', { class: 'headword', lang: 'en' }, word.word),
          h('div', { class: 'flashcard__pos' }, word.pos)),
        h('p', { class: 'flashcard__hint' }, '탭해서 뜻 보기')),
      h('div', { class: 'flashcard__face flashcard__back', 'aria-hidden': 'true' },
        h('div', { class: 'flashcard__top' },
          h('span', { class: 'flashcard__pos' }, `${word.word} · ${word.pos}`),
          speakBtn?.cloneNode(true)),
        h('div', { class: 'flashcard__body' },
          h('div', { class: 'flashcard__meaning' }, word.meaning),
          h('div', null,
            h('div', { class: 'flashcard__label' }, '짝꿍 표현'),
            h('div', { class: 'flashcard__colloc', lang: 'en' }, collocNodes(word)))),
        h('p', { class: 'flashcard__hint' }, '탭해서 단어 보기'))));

  // 뒷면의 발음 버튼은 복제본이라 이벤트를 다시 단다.
  card.querySelector('.flashcard__back .icon-btn')?.addEventListener('click', (e) => { e.stopPropagation(); speak(word.word); });

  const flip = () => {
    const flipped = card.classList.toggle('is-flipped');
    card.querySelector('.flashcard__front').setAttribute('aria-hidden', String(flipped));
    card.querySelector('.flashcard__back').setAttribute('aria-hidden', String(!flipped));
  };
  card.addEventListener('click', flip);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
  });
  return card;
}

// 결과·오답노트·단어장에서 쓰는 한 줄짜리 단어 행. 탭하면 onClick.
export function wordRow(word, { onClick, aside } = {}) {
  return h('li', null, h('button', { class: 'word-row', type: 'button', onClick },
    h('span', { class: 'word-row__head', lang: 'en' }, word.word),
    h('span', { class: 'word-row__meaning' }, word.meaning),
    aside != null ? h('span', { class: 'word-row__aside' }, aside) : null));
}

export function ring(value, max, label, { size = 132, stroke = 10 } = {}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const target = c * (1 - Math.min(value / max, 1));
  const el = h('div', { class: 'ring', role: 'img', 'aria-label': `${label} ${value}/${max}` });
  el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
    <circle class="ring__track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}"/>
    <circle class="ring__bar" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}"
      stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}"/>
  </svg>`;
  el.append(h('div', { class: 'ring__label' },
    h('div', { class: 'num t-28', style: { fontWeight: 600 } }, value),
    h('div', { class: 't-12 muted' }, `/ ${max} ${label}`)));
  const bar = el.querySelector('.ring__bar');
  requestAnimationFrame(() => requestAnimationFrame(() => bar.setAttribute('stroke-dashoffset', target)));
  return el;
}

export function sheet(content, { onClose } = {}) {
  const box = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true' }, h('div', { class: 'sheet__grip' }), content);
  const backdrop = h('div', { class: 'sheet-backdrop' }, box);
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  function close() {
    backdrop.remove();
    document.removeEventListener('keydown', onKey);
    onClose?.();
  }
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', onKey);
  document.body.append(backdrop);
  box.querySelector('button, [tabindex]')?.focus({ preventScroll: true });
  return { close, el: box };
}

export function confirmSheet({ title, message, confirmLabel = '확인', cancelLabel = '취소', danger = false }) {
  return new Promise((resolve) => {
    let answered = false;
    const done = (v) => { if (!answered) { answered = true; resolve(v); } };
    const s = sheet(h('div', null,
      h('h2', { class: 'sheet__title' }, title),
      message ? h('p', { class: 'muted' }, message) : null,
      h('div', { class: 'sheet__actions' },
        h('button', { class: 'btn btn--quiet', type: 'button', onClick: () => { done(false); s.close(); } }, cancelLabel),
        h('button', { class: `btn ${danger ? 'btn--danger' : 'btn--primary'}`, type: 'button', onClick: () => { done(true); s.close(); } }, confirmLabel))),
    { onClose: () => done(false) });
  });
}

let toastTimer;
export function toast(msg) {
  document.querySelector('.toast')?.remove();
  clearTimeout(toastTimer);
  const el = h('div', { class: 'toast', role: 'status' }, msg);
  document.body.append(el);
  toastTimer = setTimeout(() => el.remove(), 2600);
}
