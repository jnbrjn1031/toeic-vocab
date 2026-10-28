// 날짜는 모두 기기 로컬 날짜 'YYYY-MM-DD' 문자열로 다룬다.
// toISOString()은 UTC라서 한국 시간 오전 9시 전에 하루가 어긋나므로 쓰지 않는다.

const pad = (n) => String(n).padStart(2, '0');
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function toDateStr(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parts(s) {
  const [y, m, d] = s.split('-').map(Number);
  return [y, m, d];
}

function utcDays(s) {
  const [y, m, d] = parts(s);
  return Date.UTC(y, m - 1, d) / 86400000;
}

export function diffDays(a, b) {
  return utcDays(b) - utcDays(a);
}

export function addDays(s, n) {
  const [y, m, d] = parts(s);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

export function formatMonthDay(s) {
  const [y, m, d] = parts(s);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${m}/${d}(${weekday})`;
}
