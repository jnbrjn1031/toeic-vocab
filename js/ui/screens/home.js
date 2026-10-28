// 홈: 오늘 학습 카드(주인공), 전체 진행, 계획 대비, 시험 D-day, 하단 시작/이어하기 버튼.
import { h, icon } from '../dom.js';
import { ring } from '../widgets.js';
import { canStartDay, startOrResumeDay, startOrResumePractice, practiceKeys } from '../actions.js';
import { TOTAL_DAYS, setsForDay, newSetForDay } from '../../core/schedule.js';
import { daysBehind, streak, learnedCount, ddayLabel } from '../../core/progress.js';
import { formatMonthDay } from '../../core/dates.js';

const pad = (n) => String(n).padStart(2, '0');
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

function sessionStatus(s) {
  switch (s.stage) {
    case 'study': return `카드 ${s.cardIndex + 1} / ${s.cardKeys.length} 보는 중`;
    case 'quiz': return `퀴즈 ${s.answers.length} / ${s.questions.length} 푸는 중`;
    case 'result': return '퀴즈 결과 확인 중';
    case 'reviewStudy':
    case 'reviewQuiz': return '틀린 단어 복습 중';
    default: return '마무리 중';
  }
}

function todayCard(ctx, { day, s, locked, finished }) {
  if (finished) {
    return h('article', { class: 'today today--finished' },
      h('p', { class: 'today__label' }, '52일 과정'),
      h('p', { class: 'today__title' }, '완주!'),
      h('p', { class: 'today__note' }, '오답노트로 약한 단어를 다시 풀어 보세요.'));
  }
  const sets = setsForDay(day);
  const newSet = newSetForDay(day);
  const count = (list) => list.reduce((n, set) => n + (ctx.vocab.sets[set - 1]?.length ?? 0), 0);
  const newCount = newSet ? count([newSet]) : 0;
  const reviewCount = count(sets.filter((x) => x !== newSet));
  const label = s ? '이어서 학습' : locked ? '내일 학습' : '오늘 학습';

  return h('article', { class: `today${locked ? ' today--locked' : ''}` },
    h('p', { class: 'today__label' }, label),
    h('p', { class: 'today__title' }, h('span', { class: 'num' }, String(day)), '일차'),
    h('p', { class: 'today__sets' }, `Set ${sets.map(pad).join(' · ')}`),
    h('dl', { class: 'today__counts' },
      h('div', null, h('dt', null, '새 단어'), h('dd', { class: 'num' }, String(newCount))),
      h('div', null, h('dt', null, '복습'), h('dd', { class: 'num' }, String(reviewCount))),
      h('div', null, h('dt', null, '합계'), h('dd', { class: 'num' }, String(newCount + reviewCount)))),
    s ? h('p', { class: 'today__note' }, sessionStatus(s)) : null,
    locked ? h('p', { class: 'today__note' }, '오늘 분량을 끝냈어요. 다음 학습은 내일 0시에 열려요.') : null);
}

export function render(ctx) {
  const d = ctx.data;
  const today = ctx.today();
  const completed = d.days.length;
  const s = d.session;
  const finished = completed >= TOTAL_DAYS && !s;
  const open = canStartDay(ctx);
  const locked = !s && !open && !finished;
  const day = s ? s.day : Math.min(completed + 1, TOTAL_DAYS);

  const behind = daysBehind(d.settings.startDate, today, completed);
  const streakDays = streak(d.days.map((x) => x.date), today);
  const [y, m, dd] = today.split('-').map(Number);
  const weekday = WEEKDAY[new Date(y, m - 1, dd).getDay()];

  let action;
  if (finished) {
    action = h('button', { class: 'btn btn--primary btn--lg', type: 'button', disabled: !practiceKeys(ctx).length, onClick: () => startOrResumePractice(ctx) }, '오답만 퀴즈');
  } else if (s) {
    action = h('button', { class: 'btn btn--primary btn--lg', type: 'button', onClick: () => startOrResumeDay(ctx) }, '이어하기');
  } else if (open) {
    action = h('button', { class: 'btn btn--primary btn--lg', type: 'button', onClick: () => startOrResumeDay(ctx) }, `${day}일차 시작`);
  } else {
    action = h('button', { class: 'btn btn--primary btn--lg', type: 'button', disabled: true }, '오늘 학습 완료 · 내일 열려요');
  }

  const exams = d.settings.exams.map((date, i) => h('div', { class: 'exam' },
    h('p', { class: 'exam__label' }, `${i + 1}차 시험`),
    h('p', { class: 'exam__dday num' }, ddayLabel(date, today)),
    h('p', { class: 'exam__date' }, formatMonthDay(date))));

  return h('section', { class: 'home' },
    h('header', { class: 'topbar' },
      h('h1', { class: 'home__date' }, `${m}월 ${dd}일 ${weekday}요일`),
      h('a', { class: 'icon-btn', href: '#/settings', 'aria-label': '설정' }, icon('gear'))),
    todayCard(ctx, { day, s, locked, finished }),
    h('div', { class: 'overview' },
      ring(learnedCount(completed), 500, '단어'),
      h('dl', { class: 'overview__list' },
        h('div', null, h('dt', null, '연속 학습'), h('dd', null, h('span', { class: 'num' }, String(streakDays)), '일')),
        h('div', null, h('dt', null, '진행'), h('dd', null, h('span', { class: 'num' }, `${completed} / ${TOTAL_DAYS}`), '일')),
        h('div', null, h('dt', null, '계획 대비'), h('dd', null,
          h('span', { class: `chip ${behind ? 'chip--behind' : 'chip--ok'}` }, behind ? `${behind}일 밀림` : '계획대로'))))),
    h('div', { class: 'exams' }, exams),
    h('div', { class: 'dock-spacer' }),
    h('div', { class: 'dock' }, action));
}
