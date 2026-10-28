// 학습일 세션(slot 'session')과 오답 연습(slot 'practice') 화면.
// 진행 상태는 전부 data[slot]에 있고, 동작마다 저장되므로 언제 닫아도 같은 자리에서 이어진다.
import { h, icon, vibrate, reducedMotion } from '../dom.js';
import { wordCard, wordRow } from '../widgets.js';
import { setCard, beginQuiz, nextQuestion, leaveResult } from '../../core/session.js';
import { applyAnswer, finishDay } from '../../core/records.js';
import { streak } from '../../core/progress.js';

const TYPE_LABEL = { w2m: '단어 → 뜻', m2w: '뜻 → 단어', blank: '짝꿍 표현 빈칸' };
const SWIPE_PX = 60;

let enterFrom = null; // 새 카드가 들어오는 방향(넘김 애니메이션용)
let justAnswered = false; // 방금 답한 문제에만 피드백 애니메이션을 준다

// slot 세션에 fn을 적용한다. 바뀐 게 없으면 data를 그대로 돌려줘 저장·렌더를 건너뛴다.
const onSlot = (slot, fn) => (d) => {
  if (!d[slot]) return d;
  const next = fn(d[slot]);
  return next === d[slot] ? d : { ...d, [slot]: next };
};

export function render(ctx, slot) {
  const s = ctx.data[slot];
  if (!s) {
    queueMicrotask(() => ctx.go('#/home', { replace: true }));
    return h('section');
  }
  switch (s.stage) {
    case 'study':
    case 'reviewStudy':
      return studyView(ctx, slot, s);
    case 'quiz':
    case 'reviewQuiz':
      return quizView(ctx, slot, s);
    case 'result':
      return resultView(ctx, slot, s);
    default:
      return doneView(ctx, slot);
  }
}

function head(ctx, title, counter) {
  return h('header', { class: 'topbar' },
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': '홈으로', onClick: () => ctx.go('#/home') }, icon('back')),
    h('h1', null, title),
    counter ? h('span', { class: 'num t-14 muted' }, counter) : null);
}

function progressBar(value, max) {
  return h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(max), 'aria-valuenow': String(value) },
    h('div', { class: 'progress__bar', style: { width: `${max ? (value / max) * 100 : 0}%` } }));
}

function titleOf(s) {
  if (s.kind === 'practice') return '오답 연습';
  if (s.stage === 'reviewStudy') return '오답 복습';
  if (s.stage === 'reviewQuiz') return '오답 다시 풀기';
  return s.stage === 'quiz' ? `${s.day}일차 퀴즈` : `${s.day}일차 학습`;
}

// ───────── 카드 학습 ─────────

function attachSwipe(stage, onSwipe) {
  let x0 = null;
  let y0 = 0;
  let dx = 0;
  let dragging = false;
  let swiped = false;
  const card = () => stage.firstElementChild;

  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    x0 = e.clientX;
    y0 = e.clientY;
    dx = 0;
    dragging = false;
  });
  stage.addEventListener('pointermove', (e) => {
    if (x0 === null) return;
    dx = e.clientX - x0;
    if (!dragging && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(e.clientY - y0)) {
      dragging = true;
      stage.setPointerCapture?.(e.pointerId);
      card().classList.add('is-dragging');
    }
    if (dragging) card().style.transform = `translateX(${dx}px) rotate(${dx / 28}deg)`;
  });
  const end = () => {
    if (x0 === null) return;
    x0 = null;
    if (!dragging) return;
    swiped = true;
    card().classList.remove('is-dragging');
    const moved = Math.abs(dx) > SWIPE_PX && onSwipe(dx < 0 ? 1 : -1);
    if (!moved) card().style.transform = '';
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  // 스와이프 직후의 click이 카드를 뒤집지 않게 막는다(캡처 단계라 카드의 click보다 먼저 실행).
  stage.addEventListener('click', (e) => {
    if (swiped) {
      swiped = false;
      e.stopPropagation();
    }
  }, true);
}

function studyView(ctx, slot, s) {
  const review = s.stage === 'reviewStudy';
  const total = s.cardKeys.length;
  const key = s.cardKeys[s.cardIndex];
  const word = ctx.vocab.byKey.get(key);
  const badge = review ? '오답' : s.newKeys.includes(key) ? 'NEW' : '복습';
  const last = s.cardIndex >= total - 1;

  const move = (delta) => {
    const i = s.cardIndex + delta;
    if (i < 0 || i >= total) return false;
    enterFrom = delta > 0 ? 'right' : 'left';
    ctx.update(onSlot(slot, (x) => setCard(x, i)));
    return true;
  };
  const startQuiz = () => ctx.update(onSlot(slot, (x) => beginQuiz(x, ctx.vocab, Math.random)));

  const card = wordCard(word, { badge });
  if (enterFrom) {
    card.classList.add(`enter-${enterFrom}`);
    enterFrom = null;
  }
  const stage = h('div', { class: 'card-stage' }, card);
  attachSwipe(stage, move);

  let note = null;
  if (review) note = s.round >= 2 ? `${total}개 남았어요. 한 번 더!` : `틀린 ${total}개를 다시 보고 퀴즈를 풀어요.`;

  return h('section', { class: 'session' },
    head(ctx, titleOf(s), `${s.cardIndex + 1} / ${total}`),
    progressBar(s.cardIndex + 1, total),
    note ? h('p', { class: 'session-note' }, note) : null,
    stage,
    h('div', { class: 'dock-spacer' }),
    h('div', { class: 'dock' },
      h('button', { class: 'btn btn--quiet', type: 'button', disabled: s.cardIndex === 0, onClick: () => move(-1) }, icon('back'), '이전'),
      last
        ? h('button', { class: 'btn btn--primary', type: 'button', onClick: startQuiz }, '퀴즈 시작')
        : h('button', { class: 'btn btn--primary', type: 'button', onClick: () => move(1) }, '다음', icon('next'))));
}

// ───────── 퀴즈 ─────────

function blankNodes(prompt, filled) {
  const [before, after] = prompt.split('_____');
  return [before, h('span', { class: `blank${filled ? ' is-filled' : ''}` }, filled ?? ' '), after];
}

function quizView(ctx, slot, s) {
  const q = s.questions[s.qIndex];
  const answer = s.answers[s.qIndex];
  const total = s.questions.length;
  const word = ctx.vocab.byKey.get(q.key);
  const animate = justAnswered;
  justAnswered = false;

  const choose = (i) => {
    if (answer) return;
    justAnswered = true;
    ctx.update((d) => applyAnswer(d, slot, i, ctx.today()));
    const a = ctx.data[slot]?.answers[s.qIndex];
    if (a) vibrate(a.correct ? 'correct' : 'wrong');
  };

  let prompt;
  if (q.type === 'w2m') {
    prompt = [h('div', { class: 'headword', lang: 'en' }, q.prompt), h('div', { class: 'flashcard__pos' }, word?.pos ?? '')];
  } else if (q.type === 'm2w') {
    prompt = [h('div', { class: 'prompt__meaning' }, q.prompt)];
  } else {
    prompt = [
      h('div', { class: 'prompt__blank', lang: 'en' }, blankNodes(q.prompt, answer ? q.options[q.answerIndex] : null)),
      h('div', { class: 'prompt__hint' }, `뜻: ${q.hint}`),
    ];
  }

  const options = q.options.map((text, i) => {
    let state = '';
    if (answer) state = i === q.answerIndex ? 'is-correct' : i === answer.chosen ? 'is-wrong' : 'is-dim';
    const motion = animate && (state === 'is-correct' && answer.correct ? ' pop' : state === 'is-wrong' ? ' shake' : '');
    return h('button', {
      class: `option${q.type === 'w2m' ? '' : ' en'}${state ? ` ${state}` : ''}${motion || ''}`,
      type: 'button',
      lang: q.type === 'w2m' ? null : 'en',
      disabled: Boolean(answer),
      'aria-label': state === 'is-correct' ? `${text}, 정답` : state === 'is-wrong' ? `${text}, 고른 답, 오답` : null,
      onClick: () => choose(i),
    },
    h('span', null, text),
    state === 'is-correct' ? icon('check') : state === 'is-wrong' ? icon('cross') : null);
  });

  const feedback = answer && word
    ? h('div', { class: `feedback ${answer.correct ? 'is-correct' : 'is-wrong'}`, role: 'status' },
        h('p', { class: 'feedback__verdict' }, icon(answer.correct ? 'check' : 'cross'), answer.correct ? '정답이에요' : '틀렸어요'),
        h('div', { class: 'feedback__word' },
          h('span', { class: 'feedback__head', lang: 'en' }, word.word),
          h('span', { class: 't-14 muted' }, word.pos)),
        h('p', null, word.meaning),
        h('p', { class: 'feedback__colloc', lang: 'en' }, word.colloc))
    : null;

  const isLast = s.qIndex === total - 1;
  return h('section', { class: 'session session--quiz' },
    head(ctx, titleOf(s), `${s.qIndex + 1} / ${total}`),
    progressBar(s.answers.length, total),
    h('p', { class: 'quiz-type' }, TYPE_LABEL[q.type]),
    h('div', { class: `prompt prompt--${q.type}` }, prompt),
    h('div', { class: 'options' }, options),
    feedback,
    h('div', { class: 'dock-spacer' }),
    answer
      ? h('div', { class: 'dock' },
          h('button', { class: 'btn btn--primary btn--lg', type: 'button', onClick: () => ctx.update(onSlot(slot, nextQuestion)) },
            isLast ? '결과 보기' : '다음'))
      : null);
}

// ───────── 결과 ─────────

function resultView(ctx, slot, s) {
  const { correct, total } = s.firstScore;
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const missed = s.firstMissed.map((k) => ctx.vocab.byKey.get(k)).filter(Boolean);
  const practice = s.kind === 'practice';

  return h('section', { class: 'session' },
    head(ctx, practice ? '오답 연습 결과' : `${s.day}일차 퀴즈 결과`),
    h('div', { class: 'result-score' },
      h('p', { class: 'result-score__big num' }, String(correct), h('span', { class: 'result-score__total' }, ` / ${total}`)),
      h('p', { class: 'muted' }, '정답률 ', h('span', { class: 'num' }, `${pct}%`))),
    missed.length
      ? h('div', null,
          h('h2', { class: 'section-title' }, `틀린 단어 ${missed.length}개`),
          h('ul', { class: 'word-rows' }, missed.map((w) => wordRow(w, { onClick: () => ctx.openWord(w.key) }))))
      : h('p', { class: 'result-perfect' }, '모두 맞혔어요!'),
    h('div', { class: 'dock-spacer' }),
    h('div', { class: 'dock' },
      h('button', { class: 'btn btn--primary btn--lg', type: 'button', onClick: () => ctx.update(onSlot(slot, leaveResult)) },
        !practice && missed.length ? '틀린 단어 복습하기' : '완료')));
}

// ───────── 완료 ─────────

function confetti(host) {
  const colors = ['var(--accent)', 'var(--correct)', '#E8B44C', '#E58A6B', 'var(--accent-soft)'];
  const layer = h('div', { class: 'confetti', 'aria-hidden': 'true' });
  for (let i = 0; i < 36; i++) {
    layer.append(h('i', {
      style: {
        '--x': `${Math.random() * 100}%`,
        '--dx': `${(Math.random() - 0.5) * 120}px`,
        '--r': `${(Math.random() - 0.5) * 900}deg`,
        '--d': `${Math.random() * 0.35}s`,
        '--t': `${1.3 + Math.random() * 0.8}s`,
        '--c': colors[i % colors.length],
      },
    }));
  }
  host.append(layer);
  setTimeout(() => layer.remove(), 2600);
}

function doneView(ctx, slot) {
  if (slot === 'practice') {
    ctx.update((d) => ({ ...d, practice: null }), { render: false });
    queueMicrotask(() => ctx.go('#/home', { replace: true }));
    return h('section');
  }
  try {
    ctx.update((d) => finishDay(d, ctx.today()), { render: false });
  } catch (e) {
    ctx.toast(e.message);
    queueMicrotask(() => ctx.go('#/home', { replace: true }));
    return h('section');
  }

  const rec = ctx.data.days.at(-1);
  const pct = rec.firstScore.total ? Math.round((rec.firstScore.correct / rec.firstScore.total) * 100) : 0;
  const days = streak(ctx.data.days.map((x) => x.date), ctx.today());
  const stat = (label, value) => h('div', null, h('dt', null, label), h('dd', { class: 'num' }, value));

  const view = h('section', { class: 'session complete' },
    h('div', { class: 'complete__mark' }, icon('check')),
    h('h1', { class: 'complete__title' }, `${rec.day}일차 완료!`),
    h('p', { class: 'muted' }, rec.day >= 52 ? '52일 과정을 모두 마쳤어요.' : '오늘 분량을 모두 끝냈어요.'),
    h('dl', { class: 'complete__stats' },
      stat('첫 퀴즈', `${rec.firstScore.correct}/${rec.firstScore.total}`),
      stat('정답률', `${pct}%`),
      stat('연속 학습', `${days}일`)),
    h('div', { class: 'dock-spacer' }),
    h('div', { class: 'dock' },
      h('button', { class: 'btn btn--primary btn--lg', type: 'button', onClick: () => ctx.go('#/home', { replace: true }) }, '홈으로')));
  if (!reducedMotion()) confetti(view);
  return view;
}
