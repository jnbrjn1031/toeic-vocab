// 설정: 테마, 학습 일정, 하루 여러 학습일, 백업 내보내기/가져오기, 전체 초기화.
import { h, icon } from '../dom.js';
import { confirmSheet } from '../widgets.js';
import { applyTheme } from '../theme.js';
import { serialize, deserialize, defaultData } from '../../core/records.js';
import { reconcileSession } from '../../core/session.js';

const THEMES = [['system', '시스템'], ['light', '라이트'], ['dark', '다크']];

function setSetting(ctx, patch) {
  ctx.update((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
}

function dateRow(ctx, label, value, onPick) {
  return h('label', { class: 'setting' },
    h('span', { class: 'setting__label' }, label),
    h('input', {
      class: 'setting__date num',
      type: 'date',
      value,
      onChange: (e) => {
        if (e.target.value) onPick(e.target.value);
        else e.target.value = value; // 지우기는 허용하지 않는다
      },
    }));
}

async function exportBackup(ctx) {
  const name = `toeic-vocab-backup-${ctx.today()}.json`;
  const blob = new Blob([serialize(ctx.data)], { type: 'application/json' });
  const file = new File([blob], name, { type: 'application/json' });
  // 폰에서는 공유 시트(파일 앱·드라이브·메신저 저장)를, 그 밖에서는 다운로드를 쓴다.
  if (window.matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: '토익 단어 백업' });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  ctx.toast('백업 파일을 저장했어요');
}

async function importBackup(ctx, file) {
  let next;
  try {
    next = deserialize(await file.text());
  } catch (e) {
    ctx.toast(e.message);
    return;
  }
  const ok = await confirmSheet({
    title: '현재 기록을 덮어쓸까요?',
    message: `백업에 있는 ${next.days.length}일치 학습 기록으로 바꿔요. 지금 기록은 사라져요.`,
    confirmLabel: '덮어쓰기',
  });
  if (!ok) return;
  next = {
    ...next,
    session: reconcileSession(next.session, ctx.vocab.byKey),
    practice: reconcileSession(next.practice, ctx.vocab.byKey),
  };
  ctx.update(() => next);
  applyTheme(next.settings.theme);
  ctx.toast('백업을 불러왔어요');
}

async function resetAll(ctx) {
  const first = await confirmSheet({
    title: '모든 기록을 지울까요?',
    message: '학습 기록, 오답 기록, 설정이 모두 지워져요. 먼저 백업을 내보내 두는 걸 권해요.',
    confirmLabel: '계속',
  });
  if (!first) return;
  const second = await confirmSheet({
    title: '정말 모두 지울까요? 되돌릴 수 없어요.',
    confirmLabel: '모두 지우기',
    danger: true,
  });
  if (!second) return;
  ctx.update(() => defaultData());
  applyTheme('system');
  ctx.toast('모든 기록을 지웠어요');
}

export function render(ctx) {
  const st = ctx.data.settings;
  const fileInput = h('input', {
    type: 'file',
    accept: '.json,application/json',
    hidden: true,
    onChange: (e) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (file) importBackup(ctx, file);
    },
  });

  return h('section', { class: 'settings' },
    h('header', { class: 'topbar' },
      h('button', { class: 'icon-btn', type: 'button', 'aria-label': '뒤로', onClick: () => ctx.go('#/home') }, icon('back')),
      h('h1', null, '설정')),

    h('h2', { class: 'group-title' }, '화면'),
    h('div', { class: 'group' },
      h('div', { class: 'setting' },
        h('span', { class: 'setting__label' }, '테마'),
        h('div', { class: 'segmented', role: 'group', 'aria-label': '테마' },
          THEMES.map(([value, label]) => h('button', {
            type: 'button',
            'aria-pressed': String(st.theme === value),
            onClick: () => {
              setSetting(ctx, { theme: value });
              applyTheme(value);
            },
          }, label))))),

    h('h2', { class: 'group-title' }, '학습 일정'),
    h('div', { class: 'group' },
      dateRow(ctx, '계획 시작일', st.startDate, (v) => setSetting(ctx, { startDate: v })),
      dateRow(ctx, '1차 시험일', st.exams[0], (v) => setSetting(ctx, { exams: [v, st.exams[1]] })),
      dateRow(ctx, '2차 시험일', st.exams[1], (v) => setSetting(ctx, { exams: [st.exams[0], v] })),
      h('div', { class: 'setting setting--switch' },
        h('div', null,
          h('span', { class: 'setting__label', id: 'multi-label' }, '하루에 여러 학습일 허용'),
          h('p', { class: 'setting__help' }, '켜면 그날 학습을 끝낸 뒤 바로 다음 학습일을 시작할 수 있어요.')),
        h('button', {
          class: 'switch',
          type: 'button',
          role: 'switch',
          'aria-checked': String(st.allowMultiplePerDay),
          'aria-labelledby': 'multi-label',
          onClick: () => setSetting(ctx, { allowMultiplePerDay: !st.allowMultiplePerDay }),
        }, h('span', { class: 'switch__knob' })))),

    h('h2', { class: 'group-title' }, '기록'),
    h('div', { class: 'group' },
      h('button', { class: 'setting setting--action', type: 'button', onClick: () => exportBackup(ctx) },
        h('span', { class: 'setting__label' }, '백업 내보내기'), icon('next')),
      h('button', { class: 'setting setting--action', type: 'button', onClick: () => fileInput.click() },
        h('span', { class: 'setting__label' }, '백업 가져오기'), icon('next')),
      fileInput),
    h('p', { class: 'group-help' }, '폰을 바꾸거나 브라우저 데이터를 지우기 전에 백업을 내보내 두세요.'),

    h('div', { class: 'group group--danger' },
      h('button', { class: 'setting setting--action', type: 'button', onClick: () => resetAll(ctx) },
        h('span', { class: 'setting__label' }, '전체 초기화'))));
}
