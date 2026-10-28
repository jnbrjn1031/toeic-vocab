// 기록: 요약, 월 달력(완료일을 첫 퀴즈 정답률 진하기로 표시), 학습일별 정답률 차트.
import { h, icon } from '../dom.js';
import { sheet, wordRow } from '../widgets.js';
import { TOTAL_DAYS } from '../../core/schedule.js';

const pad = (n) => String(n).padStart(2, '0');
const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
const SVG_NS = 'http://www.w3.org/2000/svg';

let viewMonth = null; // 'YYYY-MM'

const pctOf = (r) => (r.firstScore?.total ? Math.round((r.firstScore.correct / r.firstScore.total) * 100) : 0);

function minutes(ms) {
  const m = Math.round(ms / 60000);
  return m < 1 ? '1분 미만' : `${m}분`;
}

function shiftMonth(ym, delta) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function detailSheet(ctx, date, records) {
  const [, m, d] = date.split('-').map(Number);
  sheet(h('div', { class: 'day-detail' },
    h('h2', { class: 'sheet__title' }, `${m}월 ${d}일 학습`),
    records.map((r) => {
      const missed = r.missed.map((k) => ctx.vocab.byKey.get(k)).filter(Boolean);
      return h('section', { class: 'day-detail__item' },
        h('h3', { class: 'day-detail__day' }, `${r.day}일차`),
        h('dl', { class: 'facts' },
          h('div', null, h('dt', null, '세트'), h('dd', { class: 'en' }, `Set ${r.sets.map(pad).join(' · ')}`)),
          h('div', null, h('dt', null, '첫 퀴즈'), h('dd', { class: 'num' }, `${r.firstScore.correct}/${r.firstScore.total} (${pctOf(r)}%)`)),
          h('div', null, h('dt', null, '오답 복습'), h('dd', null, `${r.reviewRounds}회`)),
          h('div', null, h('dt', null, '소요 시간'), h('dd', null, minutes(r.activeMs)))),
        missed.length
          ? h('div', null,
              h('p', { class: 'day-detail__sub' }, `틀린 단어 ${missed.length}개`),
              h('ul', { class: 'word-rows' }, missed.map((w) => wordRow(w, { onClick: () => ctx.openWord(w.key) }))))
          : h('p', { class: 'day-detail__sub' }, '첫 퀴즈에서 모두 맞혔어요.'));
    })));
}

function calendar(ctx, byDate) {
  const today = ctx.today();
  if (!viewMonth) viewMonth = today.slice(0, 7);
  const [y, m] = viewMonth.split('-').map(Number);
  const first = new Date(y, m - 1, 1).getDay();
  const daysInMonth = new Date(y, m, 0).getDate();

  const cells = [];
  for (let i = 0; i < first; i++) cells.push(h('span', { class: 'cal__cell is-blank', 'aria-hidden': 'true' }));
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${viewMonth}-${pad(d)}`;
    const recs = byDate.get(date);
    const isToday = date === today;
    if (!recs) {
      cells.push(h('span', { class: `cal__cell${isToday ? ' is-today' : ''}` }, String(d)));
      continue;
    }
    const pct = Math.round(recs.reduce((n, r) => n + pctOf(r), 0) / recs.length);
    const mix = Math.round(22 + pct * 0.78);
    cells.push(h('button', {
      class: `cal__cell is-done${mix > 58 ? ' is-strong' : ''}${isToday ? ' is-today' : ''}`,
      type: 'button',
      style: { '--mix': `${mix}%` },
      'aria-label': `${m}월 ${d}일, ${recs.map((r) => `${r.day}일차`).join(', ')}, 첫 퀴즈 정답률 ${pct}%`,
      onClick: () => detailSheet(ctx, date, recs),
    }, String(d)));
  }

  const nav = (delta) => {
    viewMonth = shiftMonth(viewMonth, delta);
    ctx.go('#/records');
  };

  return h('div', { class: 'cal panel' },
    h('div', { class: 'cal__head' },
      h('button', { class: 'icon-btn', type: 'button', 'aria-label': '이전 달', onClick: () => nav(-1) }, icon('back')),
      h('p', { class: 'cal__month' }, `${y}년 ${m}월`),
      h('button', { class: 'icon-btn', type: 'button', 'aria-label': '다음 달', onClick: () => nav(1) }, icon('next'))),
    h('div', { class: 'cal__grid', role: 'grid' },
      WEEK.map((w) => h('span', { class: 'cal__dow' }, w)),
      cells),
    h('div', { class: 'cal__legend', 'aria-hidden': 'true' },
      h('span', null, '정답률 낮음'),
      [25, 50, 75, 100].map((p) => h('i', { style: { '--mix': `${Math.round(22 + p * 0.78)}%` } })),
      h('span', null, '높음')));
}

function svg(tag, attrs, ...children) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs ?? {})) el.setAttribute(k, v);
  el.append(...children);
  return el;
}

// 학습일(1~52)을 가로축으로 둔 얇은 막대 차트. 막대를 누르거나 가리키면 값이 위에 표시된다.
function accuracyChart(days) {
  const W = 340;
  const H = 168;
  const left = 34;
  const right = 4;
  const top = 10;
  const bottom = 22;
  const plotW = W - left - right;
  const plotH = H - top - bottom;
  const slot = plotW / TOTAL_DAYS;
  const barW = Math.max(slot - 2, 2);
  const y = (pct) => top + plotH * (1 - pct / 100);

  const readout = h('p', { class: 'chart__readout', 'aria-live': 'polite' });
  const show = (r) => {
    readout.replaceChildren(
      h('span', null, `${r.day}일차`),
      h('strong', { class: 'num' }, `${pctOf(r)}%`),
      h('span', { class: 'muted num' }, `${r.firstScore.correct}/${r.firstScore.total}`));
  };

  const plot = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart__svg', role: 'img', 'aria-label': '학습일별 첫 퀴즈 정답률 막대 차트' });
  for (const g of [0, 50, 100]) {
    plot.append(
      svg('line', { x1: left, x2: W - right, y1: y(g), y2: y(g), class: 'chart__grid' }),
      svg('text', { x: left - 6, y: y(g) + 4, class: 'chart__tick', 'text-anchor': 'end' }, `${g}%`));
  }
  for (const d of [1, 10, 20, 30, 40, 52]) {
    plot.append(svg('text', { x: left + slot * (d - 0.5), y: H - 6, class: 'chart__tick', 'text-anchor': 'middle' }, String(d)));
  }

  let active = null;
  for (const r of days) {
    const x = left + slot * (r.day - 1) + (slot - barW) / 2;
    const pct = pctOf(r);
    const barH = Math.max(plotH * (pct / 100), 2);
    const bar = svg('rect', { x, y: top + plotH - barH, width: barW, height: barH, rx: Math.min(barW / 2, 2), class: 'chart__bar' });
    const hit = svg('rect', { x: left + slot * (r.day - 1), y: top, width: slot, height: plotH, class: 'chart__hit' });
    const select = () => {
      active?.classList.remove('is-active');
      bar.classList.add('is-active');
      active = bar;
      show(r);
    };
    hit.addEventListener('pointerenter', select);
    hit.addEventListener('click', select);
    plot.append(bar, hit);
    if (r === days.at(-1)) select();
  }

  // 화면 읽기 프로그램용 표
  const table = h('table', { class: 'sr-only' },
    h('caption', null, '학습일별 첫 퀴즈 정답률'),
    h('tr', null, h('th', null, '학습일'), h('th', null, '정답률')),
    days.map((r) => h('tr', null, h('td', null, `${r.day}일차`), h('td', null, `${pctOf(r)}%`))));

  return h('div', { class: 'chart' }, readout, plot, table);
}

export function render(ctx) {
  const days = [...ctx.data.days].sort((a, b) => a.day - b.day);
  const byDate = new Map();
  for (const r of days) byDate.set(r.date, [...(byDate.get(r.date) ?? []), r]);

  const avg = days.length ? Math.round(days.reduce((n, r) => n + pctOf(r), 0) / days.length) : null;
  const totalMs = days.reduce((n, r) => n + (r.activeMs ?? 0), 0);

  return h('section', { class: 'records' },
    h('h1', { class: 'screen-title' }, '기록'),
    h('dl', { class: 'summary' },
      h('div', null, h('dt', null, '완료한 학습일'), h('dd', null, h('span', { class: 'num' }, String(days.length)), '일')),
      h('div', null, h('dt', null, '평균 정답률'), h('dd', null, avg === null ? '–' : h('span', { class: 'num' }, `${avg}%`))),
      h('div', null, h('dt', null, '총 학습 시간'), h('dd', null, days.length ? minutes(totalMs) : '–'))),
    calendar(ctx, byDate),
    h('h2', { class: 'section-title records__chart-title' }, '학습일별 첫 퀴즈 정답률'),
    days.length
      ? accuracyChart(days)
      : h('p', { class: 'empty' }, '아직 기록이 없어요. 첫 학습일을 끝내면 여기에 쌓여요.'));
}
