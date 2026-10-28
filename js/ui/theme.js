// 테마 적용: system이면 OS 설정을 따르고, light/dark면 강제한다.
// 브라우저 상단바 색(theme-color)도 실제 배경색에 맞춘다.

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
let current = 'system';

function syncThemeColor() {
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.remove());
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.content = bg;
  document.head.append(meta);
}

export function applyTheme(pref) {
  current = pref;
  if (pref === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.dataset.theme = pref;
  syncThemeColor();
}

darkQuery.addEventListener('change', () => {
  if (current === 'system') syncThemeColor();
});
