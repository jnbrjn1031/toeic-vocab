// 부트스트랩과 컨트롤러. 데이터(Data) 하나를 들고 있다가 동작마다 저장하고 현재 화면을 다시 그린다.
import { parseVocab, VocabError } from './js/core/parser.js';
import { reconcileSession, addActiveTime } from './js/core/session.js';
import { toDateStr } from './js/core/dates.js';
import { loadData, saveData, requestPersist } from './js/store.js';
import { applyTheme } from './js/ui/theme.js';
import { sheet, toast, wordCard } from './js/ui/widgets.js';
import * as home from './js/ui/screens/home.js';
import * as records from './js/ui/screens/records.js';
import * as wrong from './js/ui/screens/wrong.js';
import * as words from './js/ui/screens/words.js';
import * as settings from './js/ui/screens/settings.js';
import * as session from './js/ui/screens/session.js';
import * as errorScreen from './js/ui/screens/error.js';

const view = document.getElementById('view');
const tabbar = document.getElementById('tabbar');

const ROUTES = {
  '#/home': (c) => home.render(c),
  '#/records': (c) => records.render(c),
  '#/wrong': (c) => wrong.render(c),
  '#/words': (c) => words.render(c),
  '#/settings': (c) => settings.render(c),
  '#/session': (c) => session.render(c, 'session'),
  '#/practice': (c) => session.render(c, 'practice'),
};
const NO_TABS = new Set(['#/session', '#/practice', '#/settings']);

let vocab = null;
let data = null;
let lastRoute = null;

const ctx = {
  get vocab() { return vocab; },
  get data() { return data; },
  today: () => toDateStr(new Date()),
  update(fn, { render = true } = {}) {
    const next = fn(data);
    if (next === data) return;
    data = next;
    if (!saveData(data)) toast('저장 공간이 부족해서 저장하지 못했어요');
    if (render) renderRoute();
  },
  go(route) {
    if (location.hash === route) renderRoute();
    else location.hash = route;
  },
  openWord(key) {
    const w = vocab.byKey.get(key);
    if (w) sheet(wordCard(w));
  },
  toast,
};

function currentRoute() {
  return ROUTES[location.hash] ? location.hash : '#/home';
}

function renderRoute() {
  const route = currentRoute();
  const keepScroll = route === lastRoute ? window.scrollY : 0;
  lastRoute = route;
  document.body.classList.toggle('no-tabs', NO_TABS.has(route));
  tabbar.hidden = NO_TABS.has(route);
  for (const a of tabbar.querySelectorAll('a')) {
    if (a.getAttribute('href') === route) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  view.replaceChildren(ROUTES[route](ctx));
  window.scrollTo(0, keepScroll);
}

function showError(props) {
  document.body.classList.add('no-tabs');
  tabbar.hidden = true;
  view.replaceChildren(errorScreen.render(props));
}

// 학습 화면에 있는 동안, 화면이 보이는 시간만 세션에 더한다. 손을 놓고 오래 둔 시간은 2분까지만 센다.
const IDLE_CAP_MS = 2 * 60 * 1000;
let tick = performance.now();
function flushActiveTime() {
  const now = performance.now();
  const gap = Math.min(now - tick, IDLE_CAP_MS);
  tick = now;
  if (currentRoute() !== '#/session' || !data?.session || gap <= 0) return;
  ctx.update((d) => (d.session ? { ...d, session: addActiveTime(d.session, gap) } : d), { render: false });
}

async function loadVocab() {
  let md;
  try {
    const res = await fetch('./toeic-vocab-500.md', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    md = await res.text();
  } catch {
    showError({
      title: '단어 파일을 불러오지 못했어요',
      message: '인터넷 연결을 확인한 뒤 다시 시도해 주세요.',
      onRetry: () => location.reload(),
    });
    return null;
  }
  try {
    const parsed = parseVocab(md);
    return { ...parsed, byKey: new Map(parsed.words.map((w) => [w.key, w])) };
  } catch (e) {
    if (!(e instanceof VocabError)) throw e;
    showError({ title: '단어 파일에 문제가 있어요', message: 'toeic-vocab-500.md를 고친 뒤 다시 열어 주세요.', problems: e.problems });
    return null;
  }
}

async function boot() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});

  vocab = await loadVocab();
  if (!vocab) return;

  data = loadData();
  data = {
    ...data,
    session: reconcileSession(data.session, vocab.byKey),
    practice: reconcileSession(data.practice, vocab.byKey),
  };
  applyTheme(data.settings.theme);
  requestPersist();

  window.addEventListener('hashchange', () => {
    tick = performance.now();
    renderRoute();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushActiveTime();
    else tick = performance.now();
  });
  document.addEventListener('pointerdown', flushActiveTime, true);

  renderRoute();
}

boot();
