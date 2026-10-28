// 부트스트랩과 컨트롤러. 데이터(Data) 하나를 들고 있다가 동작마다 저장하고 현재 화면을 다시 그린다.
import { parseVocab, VocabError } from './js/core/parser.js';
import { reconcileSession, addActiveTime } from './js/core/session.js';
import { toDateStr } from './js/core/dates.js';
import { STORAGE_KEY, loadData, saveData, requestPersist } from './js/store.js';
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
let renderedDay = null;
let savedRaw = null; // 이 창이 마지막으로 읽거나 쓴 저장값. 다르면 다른 창(탭·홈 화면 앱)이 바꾼 것.

function readRaw() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return savedRaw;
  }
}

function loadFromStorage() {
  const d = loadData();
  data = { ...d, session: reconcileSession(d.session, vocab.byKey), practice: reconcileSession(d.practice, vocab.byKey) };
  savedRaw = readRaw();
}

// 다른 창이 저장한 새 기록이 있으면 불러온다. 옛 데이터로 덮어써 기록을 잃지 않기 위해서다.
function syncFromStorage() {
  if (readRaw() === savedRaw) return false;
  loadFromStorage();
  applyTheme(data.settings.theme);
  return true;
}

const ctx = {
  get vocab() { return vocab; },
  get data() { return data; },
  today: () => toDateStr(new Date()),
  update(fn, { render = true } = {}) {
    if (syncFromStorage()) {
      renderRoute();
      toast('다른 화면에서 바뀐 기록을 불러왔어요');
      return;
    }
    const next = fn(data);
    if (next === data) return;
    data = next;
    if (saveData(data)) savedRaw = JSON.stringify(data);
    else toast('저장 공간이 부족해서 저장하지 못했어요');
    if (render) renderRoute();
  },
  // replace: 방문 기록을 쌓지 않는 이동(리다이렉트). 뒤로 가기가 같은 화면을 맴돌지 않게 한다.
  go(route, { replace = false } = {}) {
    if (location.hash === route) renderRoute();
    else if (replace) location.replace(route);
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
  renderedDay = ctx.today();
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

  loadFromStorage();
  applyTheme(data.settings.theme);
  requestPersist();

  window.addEventListener('hashchange', () => {
    tick = performance.now();
    renderRoute();
  });
  // 다시 보일 때: 다른 창이 기록을 바꿨거나 자정이 지났으면 화면을 새로 그린다(잠금·D-day·스트릭 갱신).
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushActiveTime();
      return;
    }
    tick = performance.now();
    if (syncFromStorage() || ctx.today() !== renderedDay) renderRoute();
  });
  window.addEventListener('storage', (e) => {
    if ((e.key === STORAGE_KEY || e.key === null) && syncFromStorage()) renderRoute();
  });
  document.addEventListener('pointerdown', flushActiveTime, true);

  renderRoute();
}

boot();
