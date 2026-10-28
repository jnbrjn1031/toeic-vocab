# 토익 단어 앱 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `toeic-vocab-500.md`를 읽어 52일 3세트 슬라이딩 일정으로 학습 → 퀴즈 → 오답 복습을 돌리는, 설치 없는 한국어 PWA를 만들어 GitHub Pages에 배포한다.

**Architecture:** 빌드 없는 정적 사이트다. 판단 로직(파서·일정·날짜·진도·퀴즈 생성·세션 상태 머신·기록)은 `js/core/`의 순수 ES 모듈로 두고 `node --test`로 검증한다. 화면은 `js/ui/`의 바닐라 DOM 코드로 만들고, `app.js`의 컨트롤러가 데이터 하나(`Data`)를 들고 있다가 동작마다 localStorage에 저장한 뒤 다시 그린다. 라우팅은 해시 방식이고, 오프라인은 service worker로 처리한다.

**Tech Stack:** HTML/CSS/Vanilla JS(ES modules), Node 24 내장 `node:test`(테스트 전용, 의존성 0), GitHub Pages, `gh` CLI.

**Spec:** `docs/superpowers/specs/2026-10-28-toeic-vocab-app-design.md`(설계 문서)와 `toeic-app-prompt.md`(기준 명세). 둘 다 읽고 시작한다. 둘이 다르면 설계 문서를 따른다.

## Global Constraints

- 앱의 모든 UI 문구는 한국어로 쓴다. 사용자에게 보고할 때도 한국어로 한다.
- 빌드 단계가 없다. 프레임워크와 npm 의존성도 없다. `package.json`은 `"type": "module"`과 스크립트 용도로만 쓴다.
- 모든 경로는 상대 경로(`./…`)로 쓴다. 앱은 `/toeic-vocab/` 하위 경로에서 돌아가야 한다. 로컬 서버도 이 하위 경로로 띄운다.
- `toeic-vocab-500.md`가 단어 데이터의 유일한 원본이다. 앱 시작 시 `fetch('./toeic-vocab-500.md', { cache: 'no-cache' })`로 읽는다. 정확히 500단어·50세트가 아니면 에러 화면을 띄운다.
- 일정 규칙: d일차 세트 = `max(1, d-2)` ~ `min(50, d)`. 총 52일이다.
- 날짜는 `js/core/dates.js`의 로컬 `YYYY-MM-DD` 함수로만 다룬다. 날짜를 만들 때 `toISOString()`을 쓰지 않는다.
- 기본 설정: 계획 시작일 `2026-10-29`, 시험일 `2026-12-13`·`2026-12-27`, 테마 `system`, 하루 여러 학습일 허용 `false`.
- 저장은 localStorage 키 `toeic-vocab` 하나에 `schemaVersion: 1`로 한다. 사용자 동작이 하나 끝날 때마다 저장한다.
- 폰트는 두 가지만 쓴다.
  - 한국어·UI: Pretendard Variable, `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css`
  - 영어 표제어·숫자: Geist, `https://fonts.googleapis.com/css2?family=Geist:wght@400..700&display=swap`. CSS 대체 글꼴은 `'Inter Tight'`.
- 타이포그래피
  - 타입 스케일: 12/14/16/20/28/40px
  - 표제어: 40px, weight 600, `letter-spacing: -0.02em`
  - 바뀌는 숫자: `font-variant-numeric: tabular-nums`
  - 모든 폰트에 `font-display: swap`
- 색
  - 모든 색은 CSS 변수로 관리한다.
  - 라이트: 따뜻한 오프화이트 배경. 다크: 짙은 차콜 배경(`#000` 금지).
  - 강조색은 차분한 딥그린 하나뿐이다.
  - 정답/오답 색은 강조색과 확실히 다른 색을 쓰고, 항상 ✓/✕ 아이콘을 같이 붙인다.
- 모양: 카드 radius 20–24px, 얇은 테두리, 은은한 그림자, 넉넉한 여백.
- 모든 애니메이션은 `prefers-reduced-motion: reduce`이면 끄거나 줄인다.
- 레이아웃
  - 375–430px 폭 기준으로 만든다. 데스크톱에서는 가운데에 폰 폭으로 보인다.
  - safe-area inset을 반영한다.
  - 터치 영역은 최소 44px이다.
  - 주요 버튼은 화면 아래쪽에 둔다.
- 입력과 소리
  - 단어장 검색창 말고는 어디에도 타이핑 입력이 없다. 날짜는 네이티브 `<input type="date">`를 쓴다.
  - 소리는 자동으로 나지 않는다. 발음은 버튼을 누를 때만 나온다.
- `window.alert/confirm/prompt`는 쓰지 않는다. 확인이 필요하면 앱 안의 시트로 묻는다.
- 커밋 메시지 끝에는 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`을 붙인다.
- 명세 §7의 각 단계가 끝나면 무엇을 했는지 한국어로 짧게 보고한다. 단계 대응: §7.1 = Task 1–2, §7.2 = Task 3–7, §7.3 = Task 8–9, §7.4 = Task 10–11, §7.5 = Task 12. 사용자가 정해야 할 일이 생기면 그때 묻는다.
- md를 임시로 망가뜨려 확인한 뒤에는 `git checkout -- toeic-vocab-500.md`로 원복하고 `git status`로 깨끗한지 확인한다.

## Review Focus

1. **md를 Windows에서 편집해 저장한 경우**(CRLF, BOM, 셀 앞뒤 공백): 같은 500단어가 나와야 한다. → Task 1 테스트 `CRLF·BOM`.
2. **빠른 연타**(보기를 두 번 누르거나 "다음"을 두 번 누름): 답이 두 번 기록되거나 문제를 건너뛰면 안 된다. → Task 4 테스트 `이미 답한 문제`, `답하기 전 nextQuestion`.
3. **세션 진행 중에 md에서 단어가 바뀐 경우**: 이어하기를 할 때 사라진 단어만 건너뛰고, 나머지는 그대로 이어져야 한다. → Task 4 테스트 `reconcileSession`.
4. **잘못된 백업 파일을 가져온 경우**(다른 JSON, 깨진 파일, 더 새 스키마): 에러 메시지만 보여주고 기존 기록은 그대로 둬야 한다. → Task 5 테스트 `잘못된 백업`.
5. **앱을 켜 둔 채 자정이 지난 경우, 그리고 오답 연습과 학습일이 섞인 경우**: 잠금 판단은 버튼을 누르는 시점의 날짜로 해야 한다. 오답 연습은 학습일 진도와 기록을 건드리면 안 된다. → Task 2 테스트 `다음 학습일 열림`, Task 5 테스트 `applyAnswer: 연습은 기록 안 함`.

---

## File Structure

```
index.html              앱 셸: 메타, 폰트, #view, 하단 탭바
styles.css              토큰(라이트/다크), 타입 스케일, 레이아웃, 컴포넌트, 모션
app.js                  부트스트랩 + 컨트롤러(ctx) + 해시 라우터 + SW 등록 + 활동 시간 측정
manifest.webmanifest
sw.js
.nojekyll
package.json            {"type":"module", scripts: test/serve/icons} — 의존성 없음
js/core/parser.js       parseVocab, VocabError
js/core/schedule.js     setsForDay, newSetForDay, dayCards
js/core/dates.js        toDateStr, diffDays, addDays, formatMonthDay
js/core/progress.js     daysBehind, streak, canStartNextDay, learnedCount, ddayLabel
js/core/synonyms.js     SYNONYM_GROUPS
js/core/quiz.js         makeRng, shuffle, poolOf, areConfusable, blankOf, allowedTypes, buildQuestion, buildQuiz
js/core/session.js      학습일/연습 세션 상태 머신
js/core/records.js      Data 모델, 기록 갱신, 마이그레이션, 백업 직렬화
js/store.js             localStorage 입출력, persist 요청
js/ui/dom.js            h(), vibrate(), canSpeak(), speak(), reducedMotion()
js/ui/theme.js          applyTheme()
js/ui/widgets.js        wordCard(), ring(), sheet(), confirmSheet(), toast()
js/ui/screens/*.js      home, session, records, wrong, words, settings, error
icons/                  icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png
scripts/serve.js        개발용 정적 서버(/toeic-vocab/ 하위 경로)
scripts/make-icons.js   node:zlib로 PNG 아이콘 생성
tests/*.test.js
```

---

### Task 0: 저장소·도구 준비

**Files:**
- Create: `package.json`, `.nojekyll`, `scripts/serve.js`

**Interfaces:**
- Produces: `npm test`(= `node --test`), `npm run serve`(= `node scripts/serve.js`, `http://localhost:8080/toeic-vocab/`)

- [ ] **Step 1: git 초기화** — 프로젝트 폴더에서 `git init -b main`을 실행한다.
- [ ] **Step 2: gh 준비**
  - `gh --version`을 확인하고, 없으면 `winget install --id GitHub.cli -e --accept-source-agreements --accept-package-agreements`로 설치한다.
  - 설치 직후 PATH가 갱신되지 않았으면 `"C:\Program Files\GitHub CLI\gh.exe"`를 직접 쓴다.
  - 사용자에게 `! gh auth login`(GitHub.com → HTTPS → 브라우저 로그인)을 직접 실행해 달라고 한국어로 요청하고 기다린다.
- [ ] **Step 3: 커밋 신원(저장소 로컬만)**
  - `gh api user --jq '.id,.login'`로 id와 login을 얻는다.
  - `git config user.name "<login>"`, `git config user.email "<id>+<login>@users.noreply.github.com"`을 설정한다.
  - 마지막으로 `gh auth setup-git`을 실행한다.
  - 개인 이메일은 절대 쓰지 않는다.
- [ ] **Step 4: `package.json`, `.nojekyll`(빈 파일), `scripts/serve.js` 작성**
  - `scripts/serve.js`는 `node:http`로 저장소 루트를 `/toeic-vocab/` 아래에 서빙한다. `/`는 `/toeic-vocab/`로 리다이렉트한다.
  - 포트는 `PORT` 환경변수, 기본 8080이다.
  - 응답 헤더는 `Cache-Control: no-store`이다.
  - MIME: `.html` `text/html; charset=utf-8`, `.js` `text/javascript; charset=utf-8`, `.css` `text/css; charset=utf-8`, `.md` `text/markdown; charset=utf-8`, `.webmanifest` `application/manifest+json`, `.json` `application/json`, `.png` `image/png`, `.svg` `image/svg+xml`.
  - 디렉터리 요청에는 `index.html`을 준다. `..`로 루트 밖에 나가는 요청은 403으로 막는다.
- [ ] **Step 5: 확인**
  - `npm run serve`를 백그라운드로 띄운다.
  - `curl -sI http://localhost:8080/toeic-vocab/toeic-vocab-500.md` → `200`이고 `content-type: text/markdown; charset=utf-8`이어야 한다.
  - `curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/toeic-vocab/../package.json"` → `403` 또는 `404`여야 한다.
- [ ] **Step 6: Commit** — `git add -A && git commit -m "chore: 저장소와 개발 서버 준비"`

---

### Task 1: md 파서

**Files:**
- Create: `js/core/parser.js`
- Test: `tests/parser.test.js`

**Interfaces:**
- Produces:
  - `Word = { no: number, set: number, word: string, pos: 'v.'|'n.'|'adj.'|'adv.'|'prep.'|'conj.'|'phr.', meaning: string, colloc: string, key: string }`. `key`는 `word.toLowerCase()`이다.
  - `parseVocab(md: string) → { words: Word[] /* no 순 */, sets: Word[][] /* sets[0] = Set 1 */ }`
  - `class VocabError extends Error { problems: string[] }`. `message`는 `problems.join('\n')`이다.

- [ ] **Step 1: 실패하는 테스트 작성** — `tests/parser.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseVocab, VocabError } from '../js/core/parser.js';

const md = readFileSync(new URL('../toeic-vocab-500.md', import.meta.url), 'utf8');

test('실제 md: 500단어, 50세트, 세트당 10개', () => {
  const { words, sets } = parseVocab(md);
  assert.equal(words.length, 500);
  assert.equal(sets.length, 50);
  assert.ok(sets.every((s) => s.length === 10));
});

test('필드 파싱', () => {
  const { words, sets } = parseVocab(md);
  assert.deepEqual(words[0], { no: 1, set: 1, word: 'submit', pos: 'v.', meaning: '제출하다', colloc: 'submit an application', key: 'submit' });
  assert.equal(words[9].meaning, '~에도 불구하고 (뒤에 명사)');
  assert.equal(words.find((w) => w.key === 'due to').set, 3);
  assert.equal(sets[49][9].word, 'instead');
});

test('학습 구조 표는 단어로 읽지 않음', () => {
  assert.ok(!parseVocab(md).words.some((w) => w.word.includes('일차')));
});

test('CRLF·BOM이 있어도 같은 결과', () => {
  const crlf = '\uFEFF' + md.replace(/\n/g, '\r\n');
  assert.deepEqual(parseVocab(crlf).words, parseVocab(md).words);
});

test('한 행이 빠지면 VocabError (세트와 총수 명시)', () => {
  const broken = md.replace(/^\| 500 \|.*\n/m, '');
  assert.throws(() => parseVocab(broken), (e) =>
    e instanceof VocabError && e.problems.some((p) => p.includes('Set 50')) && e.problems.some((p) => p.includes('499')));
});

test('표제어가 중복되면 VocabError', () => {
  const dup = md.replace('| 2 | comply |', '| 2 | submit |');
  assert.throws(() => parseVocab(dup), (e) => e instanceof VocabError && e.problems.some((p) => p.includes('submit')));
});

test('모르는 품사면 VocabError', () => {
  const bad = md.replace('| 1 | submit | v. |', '| 1 | submit | verb |');
  assert.throws(() => parseVocab(bad), VocabError);
});
```

- [ ] **Step 2: 실패 확인** — `node --test tests/parser.test.js` → 모듈이 없어서 FAIL해야 한다.
- [ ] **Step 3: `parseVocab` 구현** — `js/core/parser.js`
  - 처음에 BOM을 제거한다. 줄은 `/\r?\n/`로 나눈다.
  - `/^##\s*Set\s+(\d+)\s*$/`을 만나면 현재 세트로 삼는다. 첫 세트 헤더 이전의 줄은 모두 무시한다.
  - 세트 안에서 `|`로 시작하는 줄을 셀로 나눈다(앞뒤 빈 셀 제거, 셀마다 trim). 첫 셀이 정수가 아닌 줄(헤더, `---` 구분선)은 건너뛴다. 셀이 5개가 아니면 문제로 기록한다.
  - 검증 결과는 한국어로 `problems`에 모은다. 하나라도 있으면 `VocabError`를 던진다.
    - `세트 N개 (50개여야 함)`
    - `Set NN: 단어 N개 (10개여야 함)`
    - `전체 N단어 (500개여야 함)`
    - `중복 단어: <word>`
    - `No N: 알 수 없는 품사 '<pos>'`
- [ ] **Step 4: 통과 확인** — `node --test tests/parser.test.js` → 7개 모두 PASS
- [ ] **Step 5: Commit** — `git add js/core/parser.js tests/parser.test.js && git commit -m "feat: md 단어 파서"`

---

### Task 2: 일정·날짜·진도

**Files:**
- Create: `js/core/schedule.js`, `js/core/dates.js`, `js/core/progress.js`
- Test: `tests/schedule.test.js`, `tests/dates.test.js`, `tests/progress.test.js`

**Interfaces:**
- Consumes: `parseVocab`, `Word`(Task 1)
- Produces:
  - `TOTAL_DAYS = 52`, `TOTAL_SETS = 50`
  - `setsForDay(d: number) → number[]`. d가 1..52 밖이면 `RangeError`를 던진다.
  - `newSetForDay(d) → number | null`
  - `dayCards(d, sets: Word[][]) → { word: Word, isNew: boolean }[]`. 새 세트가 먼저 오고, 그다음 복습 세트가 세트 번호 오름차순으로 온다. 세트 안에서는 `no` 순이다.
  - `toDateStr(date: Date) → 'YYYY-MM-DD'`(로컬), `diffDays(a, b) → number`(b − a, 일 단위), `addDays(s, n) → string`, `formatMonthDay(s) → '12/13(일)'`
  - `daysBehind(startDate, today, completedDays) → number`
  - `streak(completionDates: string[], today) → number`
  - `canStartNextDay({ completedDays, lastDate, today, allowMultiple }) → boolean`
  - `learnedCount(completedDays) → number`
  - `ddayLabel(examDate, today) → string`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/schedule.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseVocab } from '../js/core/parser.js';
import { TOTAL_DAYS, setsForDay, newSetForDay, dayCards } from '../js/core/schedule.js';

const { sets } = parseVocab(readFileSync(new URL('../toeic-vocab-500.md', import.meta.url), 'utf8'));

test('1·2·3·50·51·52일차 세트', () => {
  assert.deepEqual(setsForDay(1), [1]);
  assert.deepEqual(setsForDay(2), [1, 2]);
  assert.deepEqual(setsForDay(3), [1, 2, 3]);
  assert.deepEqual(setsForDay(50), [48, 49, 50]);
  assert.deepEqual(setsForDay(51), [49, 50]);
  assert.deepEqual(setsForDay(52), [50]);
});

test('모든 세트가 정확히 3일 연속 등장', () => {
  const seen = new Map();
  for (let d = 1; d <= TOTAL_DAYS; d++) for (const s of setsForDay(d)) seen.set(s, [...(seen.get(s) ?? []), d]);
  assert.equal(seen.size, 50);
  for (const [s, days] of seen) assert.deepEqual(days, [s, s + 1, s + 2]);
});

test('새 세트와 범위', () => {
  assert.equal(newSetForDay(1), 1);
  assert.equal(newSetForDay(50), 50);
  assert.equal(newSetForDay(51), null);
  assert.throws(() => setsForDay(0), RangeError);
  assert.throws(() => setsForDay(53), RangeError);
});

test('dayCards: 새 세트 먼저, 그다음 복습 세트 오름차순', () => {
  const cards = dayCards(3, sets);
  assert.equal(cards.length, 30);
  assert.ok(cards.slice(0, 10).every((c) => c.word.set === 3 && c.isNew));
  assert.deepEqual(cards.slice(10).map((c) => c.word.set), [...Array(10).fill(1), ...Array(10).fill(2)]);
  assert.ok(cards.slice(10).every((c) => !c.isNew));
  assert.ok(dayCards(52, sets).every((c) => !c.isNew && c.word.set === 50));
});
```

`tests/dates.test.js`:
```js
process.env.TZ = 'Asia/Seoul';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toDateStr, diffDays, addDays, formatMonthDay } from '../js/core/dates.js';

test('KST 오전 9시 전에도 로컬 날짜', () => {
  const d = new Date('2026-10-28T23:30:00Z'); // KST 10/29 08:30
  assert.equal(d.getHours(), 8, 'TZ 설정 전제 확인');
  assert.equal(toDateStr(d), '2026-10-29');
});

test('diffDays / addDays', () => {
  assert.equal(diffDays('2026-10-29', '2026-12-13'), 45);
  assert.equal(diffDays('2026-12-13', '2026-10-29'), -45);
  assert.equal(addDays('2026-10-29', 45), '2026-12-13');
  assert.equal(addDays('2026-10-29', 51), '2026-12-19');
});

test('formatMonthDay', () => {
  assert.equal(formatMonthDay('2026-12-13'), '12/13(일)');
});
```

`tests/progress.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { daysBehind, streak, canStartNextDay, learnedCount, ddayLabel } from '../js/core/progress.js';

test('계획 대비 밀린 일수', () => {
  const s = '2026-10-29';
  assert.equal(daysBehind(s, '2026-10-28', 0), 0);
  assert.equal(daysBehind(s, '2026-10-29', 0), 0);
  assert.equal(daysBehind(s, '2026-10-30', 0), 1);
  assert.equal(daysBehind(s, '2026-10-30', 1), 0);
  assert.equal(daysBehind(s, '2026-10-30', 3), 0);
  assert.equal(daysBehind(s, '2026-12-20', 51), 1);
  assert.equal(daysBehind(s, '2027-01-31', 52), 0);
});

test('스트릭', () => {
  assert.equal(streak([], '2026-10-29'), 0);
  assert.equal(streak(['2026-10-29'], '2026-10-29'), 1);
  assert.equal(streak(['2026-10-29', '2026-10-30'], '2026-10-31'), 2);
  assert.equal(streak(['2026-10-29'], '2026-10-31'), 0);
  assert.equal(streak(['2026-10-29', '2026-10-29', '2026-10-30'], '2026-10-30'), 2);
  assert.equal(streak(['2026-10-27', '2026-10-29', '2026-10-30'], '2026-10-30'), 2);
});

test('다음 학습일 열림 (누르는 시점의 날짜 기준)', () => {
  const base = { completedDays: 1, lastDate: '2026-10-29', allowMultiple: false };
  assert.equal(canStartNextDay({ completedDays: 0, lastDate: null, today: '2026-10-29', allowMultiple: false }), true);
  assert.equal(canStartNextDay({ ...base, today: '2026-10-29' }), false);
  assert.equal(canStartNextDay({ ...base, today: '2026-10-30' }), true);
  assert.equal(canStartNextDay({ ...base, today: '2026-10-29', allowMultiple: true }), true);
  assert.equal(canStartNextDay({ completedDays: 52, lastDate: '2026-12-19', today: '2026-12-25', allowMultiple: true }), false);
});

test('학습한 단어 수', () => {
  assert.equal(learnedCount(0), 0);
  assert.equal(learnedCount(1), 10);
  assert.equal(learnedCount(50), 500);
  assert.equal(learnedCount(52), 500);
});

test('D-day 표시', () => {
  assert.equal(ddayLabel('2026-12-13', '2026-10-29'), 'D-45');
  assert.equal(ddayLabel('2026-12-13', '2026-12-13'), 'D-Day');
  assert.equal(ddayLabel('2026-12-13', '2026-12-14'), '종료');
});
```

- [ ] **Step 2: 실패 확인** — `node --test tests/schedule.test.js tests/dates.test.js tests/progress.test.js` → FAIL
- [ ] **Step 3: 구현**
  - `dates.js`: `diffDays`는 날짜 성분을 `Date.UTC(y, m-1, d)`로 바꿔 빼서 서머타임 영향을 받지 않게 한다.
  - `progress.js`의 계산식:
    - `daysBehind = max(0, clamp(diffDays(start, today), 0, 52) − completedDays)`
    - `streak`: 중복 날짜를 제거하고, 오늘이 목록에 있으면 오늘부터, 없으면 어제부터 하루씩 거꾸로 센다.
    - `canStartNextDay = completedDays < 52 && (allowMultiple || lastDate !== today)`
    - `learnedCount = min(completedDays, 50) × 10`
- [ ] **Step 4: 통과 확인** — 같은 명령으로 모두 PASS
- [ ] **Step 5: Commit** — `git add js/core tests && git commit -m "feat: 52일 일정, 로컬 날짜, 진도 계산"`

---

### Task 3: 퀴즈 생성기

**Files:**
- Create: `js/core/synonyms.js`, `js/core/quiz.js`
- Test: `tests/quiz.test.js`

**Interfaces:**
- Consumes: `Word`, `parseVocab`(Task 1), `dayCards`(Task 2)
- Produces:
  - `makeRng(seed: number) → () => number`(mulberry32). 앱에서는 `Math.random`을 넘긴다.
  - `shuffle(arr, rng) → 새 배열`
  - `poolOf(w) → 'v'|'n'|'adj'|'adv'|'link'`
  - `areConfusable(a: Word, b: Word) → boolean`
  - `blankOf(w) → string | null`
  - `allowedTypes(w) → ('w2m'|'m2w'|'blank')[]`
  - `Question = { key: string, type: 'w2m'|'m2w'|'blank', prompt: string, hint: string|null, options: string[4], optionKeys: string[4], answerIndex: number }`
    - `w2m`: prompt=표제어, options=뜻
    - `m2w`: prompt=뜻, options=표제어
    - `blank`: prompt=`blankOf(w)`, hint=뜻, options=표제어
  - `buildQuestion(w, type, words, rng) → Question`
  - `buildQuiz(targets: Word[], words: Word[], rng) → Question[]`(단어당 1문제, 무작위 순서)

- [ ] **Step 1: 실패하는 테스트 작성** — `tests/quiz.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseVocab } from '../js/core/parser.js';
import { dayCards } from '../js/core/schedule.js';
import { makeRng, poolOf, areConfusable, blankOf, allowedTypes, buildQuestion, buildQuiz } from '../js/core/quiz.js';

const { words, sets } = parseVocab(readFileSync(new URL('../toeic-vocab-500.md', import.meta.url), 'utf8'));
const byKey = new Map(words.map((w) => [w.key, w]));
const W = (k) => byKey.get(k);

test('blankOf: 표제어가 그대로 있고 실제 단어가 남을 때만', () => {
  assert.equal(blankOf(W('submit')), '_____ an application');
  assert.equal(blankOf(W('eligible')), 'be _____ for');
  assert.equal(blankOf(W('due to')), '_____ bad weather');
  assert.equal(blankOf(W('although')), '_____ sales rose, ~');
  assert.equal(blankOf(W('by')), 'submit _____ Friday');
  assert.equal(blankOf(W('promote')), null);   // be promoted to manager
  assert.equal(blankOf(W('enclose')), null);   // Enclosed is ~
  assert.equal(blankOf(W('applicant')), null); // qualified applicants
  assert.equal(blankOf(W('however')), null);   // However, ~
  assert.equal(blankOf(W('whereas')), null);   // whereas B ~
  assert.equal(blankOf(W('therefore')), null); // ~; therefore, ~
});

test('poolOf: 전치사·접속사·구·접속부사는 한 풀', () => {
  assert.equal(poolOf(W('submit')), 'v');
  assert.equal(poolOf(W('deadline')), 'n');
  assert.equal(poolOf(W('eligible')), 'adj');
  assert.equal(poolOf(W('promptly')), 'adv');
  for (const k of ['however', 'despite', 'although', 'in order to', 'instead']) assert.equal(poolOf(W(k)), 'link', k);
});

test('areConfusable', () => {
  for (const [a, b] of [['due to', 'because of'], ['owing to', 'due to'], ['confirm', 'verify'], ['upon', 'as soon as'],
    ['until', 'by'], ['instead of', 'instead'], ['although', 'even though'], ['attend', 'participate']]) {
    assert.ok(areConfusable(W(a), W(b)), `${a} ~ ${b}`);
  }
  assert.ok(!areConfusable(W('despite'), W('nevertheless')));
  assert.ok(!areConfusable(W('submit'), W('comply')));
});

test('모든 단어·가능한 유형·여러 시드: 정답은 하나뿐', () => {
  for (let seed = 1; seed <= 5; seed++) {
    const rng = makeRng(seed);
    for (const w of words) for (const type of allowedTypes(w)) {
      const q = buildQuestion(w, type, words, rng);
      assert.equal(q.options.length, 4);
      assert.equal(new Set(q.options).size, 4);
      assert.equal(q.optionKeys[q.answerIndex], w.key);
      const others = q.optionKeys.filter((k) => k !== w.key).map(W);
      const all = [w, ...others];
      for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
        assert.ok(!areConfusable(all[i], all[j]), `${type} ${all[i].key} / ${all[j].key}`);
      }
      if (type === 'blank') {
        assert.equal(q.hint, w.meaning);
        for (const o of others) assert.notEqual(blankOf(o), q.prompt);
      } else assert.equal(q.hint, null);
    }
  }
});

test('같은 풀에서 오답을 고름', () => {
  const rng = makeRng(7);
  for (const k of ['despite', 'submit', 'promptly', 'eligible', 'deadline']) {
    const q = buildQuestion(W(k), 'm2w', words, rng);
    assert.ok(q.optionKeys.every((x) => poolOf(W(x)) === poolOf(W(k))), k);
  }
});

test('buildQuiz: 3일차 30문제, 단어당 1문제, 세 유형이 고르게', () => {
  const targets = dayCards(3, sets).map((c) => c.word);
  for (let seed = 1; seed <= 10; seed++) {
    const qs = buildQuiz(targets, words, makeRng(seed));
    assert.equal(qs.length, 30);
    assert.deepEqual(new Set(qs.map((q) => q.key)), new Set(targets.map((w) => w.key)));
    for (const t of ['w2m', 'm2w', 'blank']) assert.ok(qs.filter((q) => q.type === t).length >= 8, `seed ${seed} ${t}`);
  }
});
```

- [ ] **Step 2: 실패 확인** — `node --test tests/quiz.test.js` → FAIL
- [ ] **Step 3: `js/core/synonyms.js` 작성** — 아래 데이터를 그대로 넣는다. md에 없는 키는 무시한다.

```js
export const SYNONYM_GROUPS = [
  ['although', 'even though'], ['attend', 'participate'], ['notify', 'inform'], ['comprise', 'consist'],
  ['replace', 'substitute'], ['permission', 'permit'], ['personnel', 'representative'], ['profit', 'revenue'],
  ['facility', 'amenity'], ['eligible', 'qualified'], ['appropriate', 'suitable', 'adequate'],
  ['essential', 'vital', 'necessary'], ['multiple', 'numerous'], ['renowned', 'prominent'], ['sturdy', 'durable'],
  ['initially', 'originally'], ['regularly', 'periodically'], ['accurately', 'precisely'],
  ['entirely', 'completely', 'fully'], ['rarely', 'seldom'], ['promptly', 'punctually'],
  ['prior to', 'ahead of'], ['according to', 'in accordance with'], ['so that', 'in order to'],
  ['while', 'whereas'], ['on behalf of', 'instead of', 'instead'],
  ['moreover', 'furthermore', 'in addition to'], ['therefore', 'consequently', 'as a result of'],
];
```

- [ ] **Step 4: `js/core/quiz.js` 구현**
  - `poolOf`
    - `prep.`·`conj.`·`phr.`는 `'link'`이다.
    - `adv.` 중 뜻에 `(접속부사)`가 들어 있으면 `'link'`, 나머지 `adv.`는 `'adv'`이다.
    - 그 외는 품사 그대로(`'v'`, `'n'`, `'adj'`)이다.
  - 뜻 토큰: 뜻에서 `/\([^)]*\)/g`로 괄호 내용을 지우고 `,`로 나눈 뒤, 조각마다 `~`와 공백을 모두 지운다. 빈 조각은 버린다. 단어별로 캐시한다.
  - `areConfusable`: 뜻 토큰이 하나라도 겹치거나 같은 `SYNONYM_GROUPS`에 속하면 true이다.
  - `blankOf`
    - 표제어를 대소문자 무시로, 영문자 경계(`(^|[^A-Za-z])표제어(?=[^A-Za-z]|$)`)에서 처음 한 번만 찾는다.
    - 찾은 자리를 `_____`로 바꾼다. 앞쪽 경계 문자는 그대로 둔다.
    - 바꾼 뒤 남은 텍스트에 `/[A-Za-z]{2,}/`가 없으면 null을 돌려준다.
  - `allowedTypes`: `['w2m', 'm2w']`에, `blankOf`가 null이 아니면 `'blank'`를 더한다.
  - `buildQuestion`: 오답 후보는 다음 조건을 모두 만족하는 단어이다. 같은 풀을 섞은 순서로 먼저 보고, 3개가 안 차면 다른 풀을 섞은 순서로 채운다. 마지막에 4개 보기를 섞는다.
    - 정답 단어가 아니다.
    - 이미 고른 보기(정답 포함) 누구와도 `areConfusable`이 아니다.
    - 보기 문자열이 중복되지 않는다.
    - blank 유형이면 `blankOf(후보) !== prompt`이다.
  - `buildQuiz`
    - blank를 못 쓰는 단어를 먼저 처리하고, 나머지를 그다음에 처리한다. 각 그룹 안에서는 섞은 순서로 처리한다.
    - 단어마다 허용 유형 중 지금까지 가장 적게 나온 유형을 고른다. 동률이면 rng로 고른다.
    - 마지막에 문제 순서를 섞는다.
- [ ] **Step 5: 통과 확인** — `node --test tests/quiz.test.js` → PASS. 실패하면 SYNONYM_GROUPS를 고치지 말고 생성기를 고친다. 단, 새로 찾은 동의어 쌍은 그룹에 추가해도 된다.
- [ ] **Step 6: Commit** — `git add js/core/quiz.js js/core/synonyms.js tests/quiz.test.js && git commit -m "feat: 정답이 하나뿐인 4지선다 퀴즈 생성기"`

---

### Task 4: 세션 상태 머신

**Files:**
- Create: `js/core/session.js`
- Test: `tests/session.test.js`

**Interfaces:**
- Consumes: `dayCards`(Task 2), `buildQuiz`, `shuffle`, `makeRng`(Task 3)
- Produces:
  - `Vocab = { words: Word[], sets: Word[][], byKey: Map<string, Word> }`
  - `Session` 형태:
    ```
    Session = { kind: 'day'|'practice', day: number|null,
      stage: 'study'|'quiz'|'result'|'reviewStudy'|'reviewQuiz'|'done',
      cardKeys: string[], newKeys: string[], cardIndex: number,
      questions: Question[], qIndex: number, answers: { key: string, chosen: number, correct: boolean }[],
      round: number, firstScore: { correct: number, total: number } | null, firstMissed: string[],
      activeMs: number, startedOn: string }
    ```
    - JSON으로 바꿨다 되돌려도 그대로여야 한다.
    - `answers[i]`는 `questions[i]`에 대한 답이다.
    - `round`: 0은 본 퀴즈, 1 이상은 오답 재퀴즈 회차이다.
  - `PRACTICE_MAX = 30`
  - `startDaySession(day, vocab, today) → Session`(stage `study`)
  - `startPracticeSession(keys, vocab, rng, today) → Session`(stage `quiz`, 최대 30개 무작위)
  - `setCard(s, index) → Session`(index는 범위 안으로 자름)
  - `beginQuiz(s, vocab, rng) → Session`(`study`→`quiz`, `reviewStudy`→`reviewQuiz`)
  - `answerCurrent(s, optionIndex) → { session, correct, key } | null`(이미 답한 문제면 null)
  - `nextQuestion(s) → Session`(현재 문제에 답하지 않았으면 같은 객체를 그대로 돌려준다)
  - `leaveResult(s) → Session`
  - `addActiveTime(s, ms) → Session`
  - `reconcileSession(s, byKey) → Session`
- 상태 전이:
  - `nextQuestion`이 라운드 끝에 도달했을 때
    - practice이거나 round 0이면 → `result`. round 0이면 `firstScore`와 `firstMissed`를 설정한다.
    - round 1 이상이고 틀린 게 없으면 → `done`.
    - round 1 이상이고 틀린 게 있으면 → `reviewStudy`. cardKeys=틀린 키, cardIndex 0, questions·answers 비움, round+1.
  - `leaveResult`
    - practice이면 → `done`.
    - day이고 `firstMissed`가 비었으면 → `done`.
    - 그 외에는 → `reviewStudy`(cardKeys=firstMissed, round 1).

- [ ] **Step 1: 실패하는 테스트 작성** — `tests/session.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseVocab } from '../js/core/parser.js';
import { makeRng } from '../js/core/quiz.js';
import { startDaySession, startPracticeSession, setCard, beginQuiz, answerCurrent, nextQuestion, leaveResult,
  addActiveTime, reconcileSession } from '../js/core/session.js';

const parsed = parseVocab(readFileSync(new URL('../toeic-vocab-500.md', import.meta.url), 'utf8'));
const vocab = { ...parsed, byKey: new Map(parsed.words.map((w) => [w.key, w])) };
const D = '2026-10-29';
const right = (s) => s.questions[s.qIndex].answerIndex;
const wrong = (s) => (right(s) + 1) % 4;
const play = (s, pick) => { while (s.stage === 'quiz' || s.stage === 'reviewQuiz') { s = answerCurrent(s, pick(s)).session; s = nextQuestion(s); } return s; };

test('1일차 시작', () => {
  const s = startDaySession(1, vocab, D);
  assert.equal(s.stage, 'study');
  assert.equal(s.cardKeys.length, 10);
  assert.deepEqual(s.newKeys, s.cardKeys);
  assert.equal(setCard(s, 99).cardIndex, 9);
});

test('전부 맞히면 result → done, 복습 0회', () => {
  let s = beginQuiz(startDaySession(1, vocab, D), vocab, makeRng(1));
  assert.equal(s.stage, 'quiz');
  s = play(s, right);
  assert.equal(s.stage, 'result');
  assert.deepEqual(s.firstScore, { correct: 10, total: 10 });
  s = leaveResult(s);
  assert.equal(s.stage, 'done');
  assert.equal(s.round, 0);
});

test('틀린 단어만 복습, 또 틀리면 반복, 다 맞으면 done', () => {
  let s = beginQuiz(startDaySession(1, vocab, D), vocab, makeRng(2));
  let n = 0;
  s = play(s, (x) => (n++ < 2 ? wrong(x) : right(x)));
  assert.deepEqual(s.firstScore, { correct: 8, total: 10 });
  const missed = s.firstMissed;
  assert.equal(missed.length, 2);
  s = leaveResult(s);
  assert.equal(s.stage, 'reviewStudy');
  assert.deepEqual(s.cardKeys, missed);
  assert.equal(s.round, 1);
  s = beginQuiz(s, vocab, makeRng(3));
  assert.equal(s.stage, 'reviewQuiz');
  assert.equal(s.questions.length, 2);
  let m = 0;
  s = play(s, (x) => (m++ === 0 ? wrong(x) : right(x)));
  assert.equal(s.stage, 'reviewStudy');
  assert.equal(s.cardKeys.length, 1);
  assert.equal(s.round, 2);
  s = play(beginQuiz(s, vocab, makeRng(4)), right);
  assert.equal(s.stage, 'done');
  assert.equal(s.round, 2);
  assert.deepEqual(s.firstScore, { correct: 8, total: 10 });
});

test('이미 답한 문제를 다시 누르면 무시', () => {
  const s = beginQuiz(startDaySession(1, vocab, D), vocab, makeRng(5));
  const r = answerCurrent(s, wrong(s));
  assert.equal(r.correct, false);
  assert.equal(answerCurrent(r.session, right(r.session)), null);
  assert.equal(r.session.answers.length, 1);
});

test('답하기 전 nextQuestion은 아무것도 안 함', () => {
  const s = beginQuiz(startDaySession(1, vocab, D), vocab, makeRng(6));
  assert.equal(nextQuestion(s), s);
});

test('JSON 왕복 후 이어서 진행', () => {
  let s = beginQuiz(startDaySession(1, vocab, D), vocab, makeRng(7));
  s = nextQuestion(answerCurrent(s, right(s)).session);
  const r = JSON.parse(JSON.stringify(s));
  assert.deepEqual(r, s);
  assert.equal(r.qIndex, 1);
  assert.equal(play(r, right).stage, 'result');
});

test('reconcileSession: md에서 사라진 단어만 건너뜀', () => {
  let s = beginQuiz(startDaySession(1, vocab, D), vocab, makeRng(8));
  const firstKey = s.questions[0].key;
  s = nextQuestion(answerCurrent(s, right(s)).session); // 1번 답함, qIndex 1
  const byKey = new Map(vocab.byKey); byKey.delete(firstKey);
  const r = reconcileSession(s, byKey);
  assert.equal(r.questions.length, 9);
  assert.equal(r.answers.length, 0);
  assert.equal(r.qIndex, 0);
  assert.ok(!r.cardKeys.includes(firstKey));
});

test('오답 연습: 최대 30개, 퀴즈 → result → done', () => {
  const keys = parsed.words.slice(0, 40).map((w) => w.key);
  let p = startPracticeSession(keys, vocab, makeRng(9), '2026-10-30');
  assert.equal(p.kind, 'practice');
  assert.equal(p.stage, 'quiz');
  assert.equal(p.questions.length, 30);
  p = play(p, wrong);
  assert.equal(p.stage, 'result');
  assert.equal(leaveResult(p).stage, 'done');
});

test('addActiveTime 누적', () => {
  const s = addActiveTime(addActiveTime(startDaySession(1, vocab, D), 1000), 500);
  assert.equal(s.activeMs, 1500);
});
```

- [ ] **Step 2: 실패 확인** — `node --test tests/session.test.js` → FAIL
- [ ] **Step 3: `js/core/session.js` 구현** — 모든 함수는 새 객체를 돌려주고 입력을 바꾸지 않는다.
  - `reconcileSession`
    - `cardKeys`·`newKeys`·`firstMissed`에서 없는 키를 지운다. `cardIndex`는 범위 안으로 자른다.
    - 답 키가 없는 문제는 `answers`의 같은 인덱스와 함께 지운다.
    - `qIndex`는 원래 `qIndex` 앞에 남은 문제 수로 다시 정한다.
    - 오답 보기로만 쓰인 키는 그대로 둔다. 보기 텍스트가 문제에 저장돼 있기 때문이다.
- [ ] **Step 4: 통과 확인** — `node --test tests/session.test.js` → PASS
- [ ] **Step 5: Commit** — `git add js/core/session.js tests/session.test.js && git commit -m "feat: 학습→퀴즈→오답 복습 세션 상태 머신"`

---

### Task 5: 기록 모델·저장소

**Files:**
- Create: `js/core/records.js`, `js/store.js`
- Test: `tests/records.test.js`, `tests/store.test.js`

**Interfaces:**
- Consumes: `answerCurrent`(Task 4), `setsForDay`(Task 2)
- Produces:
  - `Data` 형태:
    ```
    Data = { schemaVersion: 1,
      settings: { theme: 'system'|'light'|'dark', startDate: string, exams: [string, string], allowMultiplePerDay: boolean },
      days: DayRecord[], wordStats: { [key]: { quizzed: number, missed: number, lastMissed: string|null } },
      session: Session|null, practice: Session|null }
    DayRecord = { day, date, sets: number[], firstScore: {correct,total}, missed: string[], reviewRounds: number, activeMs: number }
    ```
    - 완료한 학습일 수는 `days.length`로 센다. 따로 저장하는 값이 없다.
    - 마지막 완료 날짜는 `days.at(-1)?.date`이다.
  - `SCHEMA_VERSION = 1`, `DEFAULT_SETTINGS`, `defaultData()`
  - `recordAnswer(data, key, correct, today) → Data`
  - `applyAnswer(data, slot: 'session'|'practice', optionIndex, today) → Data`
    - 이미 답한 문제면 같은 객체를 그대로 돌려준다.
    - `wordStats`는 slot이 `'session'`일 때만 바꾼다.
  - `finishDay(data, today) → Data`
    - `data.session`이 `kind 'day'`, `stage 'done'`, `day === days.length + 1`이 아니면 `Error`를 던진다.
  - `missedList(data) → { key, missed, quizzed, lastMissed }[]`. `missed`가 많은 순이고, 같으면 `lastMissed`가 최근인 순이다. `missed ≥ 1`인 단어만 넣는다.
  - `migrate(raw) → Data`, `serialize(data) → string`, `deserialize(text) → Data`
  - `STORAGE_KEY = 'toeic-vocab'`
  - `loadData(storage = localStorage) → Data`
  - `saveData(data, storage = localStorage) → boolean`
  - `requestPersist() → Promise<void>`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/records.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseVocab } from '../js/core/parser.js';
import { makeRng } from '../js/core/quiz.js';
import { startDaySession, startPracticeSession, beginQuiz } from '../js/core/session.js';
import { DEFAULT_SETTINGS, defaultData, recordAnswer, applyAnswer, finishDay, missedList, migrate, serialize, deserialize }
  from '../js/core/records.js';

const parsed = parseVocab(readFileSync(new URL('../toeic-vocab-500.md', import.meta.url), 'utf8'));
const vocab = { ...parsed, byKey: new Map(parsed.words.map((w) => [w.key, w])) };

test('기본값', () => {
  const d = defaultData();
  assert.equal(d.schemaVersion, 1);
  assert.deepEqual(d.settings, { theme: 'system', startDate: '2026-10-29', exams: ['2026-12-13', '2026-12-27'], allowMultiplePerDay: false });
  assert.deepEqual(d.days, []);
  assert.deepEqual(d.wordStats, {});
  assert.equal(d.session, null);
  assert.equal(d.practice, null);
});

test('recordAnswer 누적', () => {
  let d = recordAnswer(defaultData(), 'submit', false, '2026-10-29');
  d = recordAnswer(d, 'submit', true, '2026-10-30');
  assert.deepEqual(d.wordStats.submit, { quizzed: 2, missed: 1, lastMissed: '2026-10-29' });
});

test('applyAnswer: 학습일은 기록, 연습은 기록 안 함', () => {
  const s = beginQuiz(startDaySession(1, vocab, '2026-10-29'), vocab, makeRng(1));
  const d1 = applyAnswer({ ...defaultData(), session: s }, 'session', s.questions[0].answerIndex, '2026-10-29');
  assert.equal(d1.wordStats[s.questions[0].key].quizzed, 1);
  assert.equal(applyAnswer(d1, 'session', 0, '2026-10-29'), d1); // 이미 답함
  const p = startPracticeSession(['submit', 'comply'], vocab, makeRng(2), '2026-10-30');
  const d2 = applyAnswer({ ...defaultData(), practice: p }, 'practice', 0, '2026-10-30');
  assert.deepEqual(d2.wordStats, {});
  assert.equal(d2.practice.answers.length, 1);
  assert.deepEqual(d2.days, []);
});

test('finishDay: 하루 기록 추가', () => {
  const done = { ...startDaySession(1, vocab, '2026-10-29'), stage: 'done', firstScore: { correct: 8, total: 10 },
    firstMissed: ['submit', 'comply'], round: 1, activeMs: 600000 };
  const d = finishDay({ ...defaultData(), session: done }, '2026-10-30');
  assert.deepEqual(d.days, [{ day: 1, date: '2026-10-30', sets: [1], firstScore: { correct: 8, total: 10 },
    missed: ['submit', 'comply'], reviewRounds: 1, activeMs: 600000 }]);
  assert.equal(d.session, null);
});

test('finishDay: 순서가 안 맞거나 안 끝난 세션은 거부', () => {
  const day2 = { ...startDaySession(2, vocab, '2026-10-29'), stage: 'done', firstScore: { correct: 1, total: 1 } };
  assert.throws(() => finishDay({ ...defaultData(), session: day2 }, '2026-10-29'));
  assert.throws(() => finishDay({ ...defaultData(), session: startDaySession(1, vocab, '2026-10-29') }, '2026-10-29'));
});

test('missedList: 틀린 횟수순, 같으면 최근 순', () => {
  let d = defaultData();
  d = recordAnswer(d, 'a', false, '2026-10-29');
  d = recordAnswer(d, 'b', false, '2026-10-29');
  d = recordAnswer(d, 'b', false, '2026-10-30');
  d = recordAnswer(d, 'c', false, '2026-10-31');
  d = recordAnswer(d, 'e', true, '2026-10-31');
  assert.deepEqual(missedList(d).map((x) => x.key), ['b', 'c', 'a']);
});

test('백업 왕복', () => {
  const d = recordAnswer(defaultData(), 'submit', false, '2026-10-29');
  assert.deepEqual(deserialize(serialize(d)), d);
});

test('잘못된 백업은 한국어 에러', () => {
  assert.throws(() => deserialize('not json'), /백업 파일/);
  assert.throws(() => deserialize('{"foo":1}'), /백업 파일/);
  assert.throws(() => deserialize(JSON.stringify({ ...defaultData(), schemaVersion: 99 })), /새 버전/);
});

test('migrate가 빠진 필드를 채움', () => {
  const d = migrate({ schemaVersion: 1, days: [] });
  assert.deepEqual(d.settings, DEFAULT_SETTINGS);
  assert.deepEqual(d.wordStats, {});
  assert.equal(d.session, null);
});
```

`tests/store.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY, loadData, saveData } from '../js/store.js';
import { defaultData, recordAnswer } from '../js/core/records.js';

const fake = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)),
  removeItem: (k) => m.delete(k), key: (i) => [...m.keys()][i] ?? null, get length() { return m.size; }, _m: m }; };

test('비어 있으면 기본값', () => assert.deepEqual(loadData(fake()), defaultData()));

test('저장 후 불러오기', () => {
  const s = fake(); const d = recordAnswer(defaultData(), 'submit', false, '2026-10-29');
  assert.equal(saveData(d, s), true);
  assert.deepEqual(loadData(s), d);
});

test('깨진 값은 따로 보관하고 기본값', () => {
  const s = fake(); s.setItem(STORAGE_KEY, '{broken');
  assert.deepEqual(loadData(s), defaultData());
  assert.ok([...s._m.keys()].some((k) => k.startsWith(`${STORAGE_KEY}:corrupt-`)));
});

test('저장 실패는 false', () => {
  const s = fake(); s.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.equal(saveData(defaultData(), s), false);
});
```

- [ ] **Step 2: 실패 확인** — `node --test tests/records.test.js tests/store.test.js` → FAIL
- [ ] **Step 3: 구현**
  - `deserialize`가 받아들이는 조건: 객체이고, `schemaVersion`이 정수이고, `days`가 배열이어야 한다. 아니면 `Error('백업 파일 형식이 아니에요.')`를 던진다.
  - `schemaVersion > 1`이면 `Error('새 버전 앱에서 만든 백업이에요. 앱을 업데이트해 주세요.')`를 던진다.
  - `migrate`는 기본값 위에 얕게 병합한다. `settings`는 한 단계 더 병합한다.
  - `requestPersist`는 `navigator.storage?.persist?.()`를 부르고, 실패해도 조용히 넘어간다.
- [ ] **Step 4: 통과 확인** — `npm test` → 전체 PASS
- [ ] **Step 5: Commit** — `git add js tests && git commit -m "feat: 기록 모델, 백업 직렬화, localStorage 저장소"`

---

### Task 6: 앱 셸·부트·컨트롤러

**Files:**
- Create: `index.html`, `styles.css`, `app.js`, `js/ui/dom.js`, `js/ui/theme.js`, `js/ui/widgets.js`, `js/ui/screens/error.js`
- 아래 화면 모듈은 placeholder로 만든다(제목만 렌더): `js/ui/screens/{home,session,records,wrong,words,settings}.js`

**Interfaces:**
- Consumes: Task 1–5 전부
- Produces(이후 모든 화면 Task가 이 계약을 쓴다):
  ```
  ctx = {
    vocab: Vocab,
    get data(): Data,
    today(): string,                       // 호출할 때마다 toDateStr(new Date())
    update(fn: (d: Data) => Data, opts?: { render?: boolean }): void,
                                           // fn이 같은 객체를 돌려주면 무시, 아니면 saveData → (render !== false면) 다시 그림
                                           // saveData가 false면 toast('저장 공간이 부족해서 저장하지 못했어요')
    go(route: string): void,               // location.hash = route
    openWord(key: string): void,           // 단어 카드 시트
    toast(msg: string): void,
  }
  ```
  - 라우트: `#/home`(기본), `#/records`, `#/wrong`, `#/words`, `#/settings`, `#/session`(학습일), `#/practice`(오답 연습)
  - 화면 모듈: `export function render(ctx): HTMLElement`. 단, `session.js`는 `render(ctx, slot)`이다.
  - `#/session`·`#/practice`·`#/settings`에서는 하단 탭바를 숨긴다.
  - `dom.js`
    - `h(tag, attrs, ...children)`: `attrs`에서 `on*` 키는 이벤트 리스너, `class`·`style`·`dataset`은 각각 처리하고, 나머지는 attribute로 넣는다.
    - `vibrate('correct'|'wrong')`
    - `canSpeak()`, `speak(text)`: en-US, rate 0.9
    - `reducedMotion()`
  - `theme.js`
    - `applyTheme(pref)`: `system`이면 `<html data-theme>`를 제거하고, 아니면 `light`/`dark`를 넣는다.
    - `<meta name="theme-color">`를 현재 실제 배경색으로 맞춘다. 시스템 테마 변경도 감지한다.
  - `widgets.js`
    - `wordCard(word, { badge: 'NEW'|'복습'|'오답'|null })`: 탭하면 뒤집히는 카드 요소
    - `ring(value, max, label)`: SVG 진행 링
    - `sheet(content) → { close }`
    - `confirmSheet({ title, message, confirmLabel, danger }) → Promise<boolean>`
    - `toast(msg)`

- [ ] **Step 1: `index.html`**
  - `lang="ko"`, `viewport-fit=cover`, `<title>토익 단어 500</title>`
  - `theme-color` 메타 2개(`media="(prefers-color-scheme: light|dark)"`)
  - `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style=default`
  - `<link rel="apple-touch-icon" href="./icons/apple-touch-icon.png">`, `<link rel="manifest" href="./manifest.webmanifest">`
  - Global Constraints의 두 폰트 링크(preconnect 포함)
  - `<main id="view">`, `<nav id="tabbar">`(홈·기록·오답노트·단어장, 아이콘은 인라인 SVG), `<script type="module" src="./app.js">`
- [ ] **Step 2: `styles.css`**
  - 토큰: `--bg --surface --text --text-2 --border --accent --accent-ink --correct --wrong --shadow --radius: 22px`, 그리고 타입 스케일 변수.
  - 라이트 값은 `:root`에 둔다. 다크 값은 `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {…} }`와 `:root[data-theme="dark"]`에 둔다.
  - 본문은 Pretendard로, `.en`/`.num`은 Geist로 지정한다. `.num`에는 tabular-nums를 건다.
  - `#app` 최대 폭은 430px이고 가운데 정렬한다. safe-area padding을 넣는다. 탭바는 하단 고정이다.
- [ ] **Step 3: `app.js` 부트 순서**
  1. md fetch, `parseVocab`. 실패하면 `error.render`를 띄운다. `VocabError`면 problems 목록을, 네트워크 실패면 "단어 파일을 불러오지 못했어요"와 다시 시도 버튼을 보여준다.
  2. `loadData()`. `data.session`·`data.practice`가 있으면 `reconcileSession`을 거친다.
  3. `applyTheme(data.settings.theme)`, `requestPersist()`
  4. `hashchange`에 맞춰 렌더한다.
  5. `'serviceWorker' in navigator`이면 `./sw.js`를 등록한다. 파일이 아직 없으면 등록 실패를 조용히 무시한다.
- [ ] **Step 4: 활동 시간 측정(app.js)** — 현재 라우트가 `#/session`이면 `visibilitychange`(hidden)와 사용자 동작마다 `performance.now()` 차이를 `addActiveTime`으로 `data.session`에 더한다(`render: false`). visible로 돌아오면 기준 시각을 다시 잡는다.
- [ ] **Step 5: 브라우저 확인** — `npm run serve` → `http://localhost:8080/toeic-vocab/`을 Chrome에서 390×844로 연다.
  - 탭 4개가 보이고 탭 전환이 되는지
  - 콘솔에 에러가 없는지
  - OS 다크 모드를 켜면 배경이 차콜로 바뀌는지
  - 임시로 md 한 줄을 지우면 에러 화면에 `Set NN: 단어 9개`가 보이는지(확인 후 Global Constraints대로 원복)
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: 앱 셸, 부트, 컨트롤러, 에러 화면"`

---

### Task 7: 학습 → 퀴즈 → 오답 복습 화면 (MVP)

**Files:**
- Modify: `js/ui/screens/session.js`, `js/ui/screens/home.js`(임시: 시작/이어하기 버튼만), `styles.css`

**Interfaces:**
- Consumes: `ctx`(Task 6), `session.js`·`records.js` 함수(Task 4–5), `wordCard`, `vibrate`, `speak`
- Produces: `render(ctx, slot)`. 시작 진입점은 `ctx.update(d => ({ ...d, session: startDaySession(d.days.length + 1, ctx.vocab, ctx.today()) }))` 다음 `ctx.go('#/session')`이다(Task 8 홈이 그대로 쓴다).

- [ ] **Step 1: stage별 뷰 구현** — `data[slot].stage`에 따라 그린다.
  - `study` / `reviewStudy`
    - 상단: `N일차 · 3/30` 또는 `오답 복습 · 1/2`
    - 카드: `wordCard`. badge는 study면 `newKeys` 포함 여부로 `NEW`/`복습`을 고르고, reviewStudy면 `오답`이다.
    - 카드 앞면: 표제어(Geist 40/600), 품사, badge
    - 카드 뒷면: 뜻, 짝꿍 표현
    - 발음 버튼은 `canSpeak()`일 때만 보인다.
    - 좌우 스와이프와 하단 `이전`/`다음` 버튼으로 `setCard`를 호출한다(`render: false` 저장 후 카드만 교체).
    - 마지막 카드에서는 하단 버튼이 `퀴즈 시작`으로 바뀐다 → `beginQuiz(s, vocab, Math.random)`
    - reviewStudy에서 round ≥ 2이면 상단에 `N개 남았어요. 한 번 더!`를 보여준다.
  - `quiz` / `reviewQuiz`
    - 상단 진행 바: `qIndex / questions.length`
    - 유형 라벨: `단어 → 뜻` / `뜻 → 단어` / `짝꿍 표현 빈칸`
    - 문제(blank면 아래에 `hint`), 보기 버튼 4개
    - 보기를 탭하면 `ctx.update(d => applyAnswer(d, slot, i, ctx.today()))` + `vibrate`
    - 답한 뒤 상태(이어하기로 들어와도 같은 상태)
      - 고른 보기: ✕와 오답 색, 정답 보기: ✓와 정답 색
      - 아래 패널: 표제어 · 뜻 · 짝꿍 표현
      - 하단 `다음` → `nextQuestion`
  - `result`
    - 점수 `8 / 10`, 정답률 `80%`, 틀린 단어 목록
    - 버튼: 틀린 게 있으면 `틀린 단어 복습하기`, 없으면 `완료`(practice는 항상 `완료`) → `leaveResult`
  - `done`
    - day면 이 단계를 그리는 순간 `ctx.update(d => finishDay(d, ctx.today()), { render: false })`를 적용한다. 그러면 `session`이 null이 되므로, 완료 화면은 `data.days.at(-1)`로 직접 그린다. `done`에서 앱이 닫혔다가 다시 열려도 같은 경로로 처리된다.
    - 완료 화면: `N일차 완료!`, 첫 퀴즈 점수, `연속 N일`(`streak`), 축하 애니메이션, `홈으로`
    - practice면 `practice: null`로 만들고 홈으로 간다. 결과는 이미 `result` 단계에서 보여줬다.
  - 해당 slot이 null인 상태로 `#/session`이나 `#/practice`에 들어오면(완료 화면 제외) 홈으로 보낸다.
- [ ] **Step 2: 임시 홈** — 버튼 하나를 둔다.
  - `data.session`이 있으면 `이어하기`
  - 없고 `canStartNextDay(...)`이면 `N일차 시작`
  - 둘 다 아니면 `오늘 학습 완료`
- [ ] **Step 3: 브라우저 확인(390×844)**
  - 1일차: 카드 10장 넘기기(스와이프·버튼), 뒤집기, 발음 버튼 → `퀴즈 시작`
  - 2문제를 일부러 틀린다 → 결과 `8 / 10` → 복습 카드 2장 → 재퀴즈 → 완료 화면 `연속 1일`
  - 2일차(DevTools에서 `allowMultiplePerDay: true`로 바꾼 뒤 시작): 퀴즈 3번째 문제에서 탭을 닫았다가 다시 연다 → 홈 `이어하기` → 같은 문제·같은 보기·같은 답 상태로 이어지는지
  - 보기 빠른 두 번 탭 → `answers`가 1개만 늘어나는지(DevTools에서 localStorage 확인)
  - `localStorage['toeic-vocab']`의 `days[0]`에 `date`, `sets [1]`, `firstScore`, `missed`, `reviewRounds 1`, `activeMs > 0`이 있는지
- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: 학습·퀴즈·오답 복습 흐름과 이어하기"`

---

### Task 8: 홈·설정

**Files:**
- Modify: `js/ui/screens/home.js`, `js/ui/screens/settings.js`, `styles.css`

**Interfaces:**
- Consumes: `ctx`, `progress.js`, `schedule.js`, `records.js`(`serialize`/`deserialize`/`defaultData`), `applyTheme`, `ring`, `confirmSheet`

- [ ] **Step 1: 홈** — 위에서 아래로 배치한다.
  - 헤더: 오른쪽 위에 설정 아이콘(`#/settings`)
  - 오늘 세션 카드
    - `N일차`, `Set 1·2·3`, `새 단어 10 · 복습 20`
    - 진행 중이면 상태 한 줄: `학습 중 12/30` · `퀴즈 중 5/30` · `오답 복습 중`
  - 시험 D-day 2개: `1차 시험 D-45 · 12/13(일)`, `2차 시험 …`(`ddayLabel`, `formatMonthDay`)
  - `연속 N일`과 계획 대비 칩: `daysBehind`가 0이면 `계획대로`, 아니면 `N일 밀림`
  - 전체 진행 링: `learnedCount / 500`, 라벨 `학습한 단어`
  - 하단 고정 큰 버튼
    - 세션이 있으면 `이어하기`
    - 시작 가능하면 `N일차 시작`
    - 오늘 끝냈고 잠겨 있으면 비활성 `오늘 학습 완료 · 내일 열려요`
    - 52일 완주면 `52일 완주!` 카드와 `오답만 퀴즈` 버튼
  - 잠금 판단(`canStartNextDay`)은 렌더할 때와 버튼을 누를 때 모두 `ctx.today()`로 다시 계산한다.
- [ ] **Step 2: 설정**
  - 테마: 시스템/라이트/다크 세그먼트. 바꾸면 바로 `applyTheme`를 부르고 저장한다.
  - 계획 시작일, 1차·2차 시험일: `<input type="date">`
  - `하루에 여러 학습일 허용` 토글
  - 백업 내보내기: 파일명 `toeic-vocab-backup-YYYY-MM-DD.json`. `navigator.canShare?.({ files })`이면 `navigator.share`를 쓰고, 아니면 `<a download>`로 받는다.
  - 가져오기: `<input type="file" accept=".json,application/json">` → `deserialize`
    - 실패하면 toast로 에러 메시지만 보여주고 데이터는 그대로 둔다.
    - 성공하면 `confirmSheet('현재 기록을 덮어쓸까요?')` → 교체
  - 전체 초기화: `confirmSheet` 2번(두 번째는 `정말 모두 지울까요? 되돌릴 수 없어요.`, danger) → `defaultData()`
- [ ] **Step 3: 브라우저 확인**
  - 홈 숫자 확인: 1일차 완료 상태에서 링 `10/500`, `연속 1일`
  - 시작일을 어제로 바꾸면 `계획대로`, 그저께로 바꾸면 `1일 밀림`
  - 다크 테마로 바꾸고 새로고침해도 유지되는지
  - 내보낸 파일 → 초기화 → 가져오기로 기록이 복원되는지
  - 엉뚱한 JSON을 가져오면 에러 toast만 뜨고 기록이 그대로인지
- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: 홈 화면과 설정(테마, 일정, 백업, 초기화)"`

---

### Task 9: 기록·오답노트·단어장

**Files:**
- Modify: `js/ui/screens/records.js`, `js/ui/screens/wrong.js`, `js/ui/screens/words.js`, `styles.css`

**Interfaces:**
- Consumes: `ctx`, `missedList`, `startPracticeSession`, `setsForDay`, `ctx.openWord`

- [ ] **Step 1: 기록 탭** — 차트를 그리기 전에 `dataviz` 스킬을 불러 읽는다.
  - 월 달력: 이전/다음 달 버튼. 학습을 완료한 날짜 칸을 강조색으로 칠한다. 진하기는 그날 첫 퀴즈 정답률(같은 날 여러 학습일이면 평균)이다.
  - 날짜를 탭하면 sheet로 상세를 보여준다(학습일마다): `N일차`, `Set …`, 첫 퀴즈 `8/10`, 틀린 단어, 복습 `N회`, 소요 시간 `12분`.
  - 학습일별 정답률 차트: 인라인 SVG, 0–100%. 기록이 없으면 빈 상태 문구 `아직 기록이 없어요`.
- [ ] **Step 2: 오답노트**
  - `missedList` 순으로 표제어 · 뜻 · `N번 틀림`을 보여준다. 탭하면 `ctx.openWord`.
  - 상단 `오답만 퀴즈` 버튼
    - `data.practice`가 있으면 이어서 한다.
    - 없으면 `startPracticeSession(missedList 키, vocab, Math.random, today)` → `#/practice`
  - 틀린 단어가 없으면 버튼을 비활성화하고 `아직 틀린 단어가 없어요`를 보여준다.
- [ ] **Step 3: 단어장**
  - Set 1–50 접이식 섹션: 헤더는 `Set 01 · 10단어`, 행은 표제어·품사·뜻이다. 탭하면 `ctx.openWord`.
  - 아직 안 배운 세트(`set > min(완료 학습일 수, 50)`이고 진행 중 세션의 새 세트도 아님)는 흐리게(opacity) 보여준다.
  - 위쪽 검색창(선택): 표제어나 뜻에 부분 일치하는 행만 보이게 하고, 해당 섹션을 펼친다.
- [ ] **Step 4: 브라우저 확인**
  - 달력에 1·2일차 완료일이 칠해지는지, 탭하면 상세가 맞는지
  - 오답노트가 횟수순인지
  - `오답만 퀴즈`를 끝내도 홈의 일차·스트릭과 오답노트 횟수가 그대로인지
  - 연습 도중 홈으로 나가서 학습일 세션을 이어해도 둘 다 각자 진행 위치를 유지하는지
  - 단어장 흐림이 맞는지, 검색 `due`로 `due to`가 나오는지
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: 기록 달력·차트, 오답노트, 단어장"`

---

### Task 10: 디자인 다듬기·모션

**Files:**
- Modify: `styles.css`, 관련 화면 모듈

- [ ] **Step 1: 모션**
  - 카드 뒤집기: 3D rotateY, 0.4s
  - 정답/오답 피드백: 정답은 보기 색 전환과 살짝 커지기, 오답은 짧은 흔들림
  - 진행 링: stroke-dashoffset 트랜지션
  - 완료 축하: CSS/JS 파티클 1.5s
  - `reducedMotion()`이거나 `prefers-reduced-motion: reduce`이면 모두 즉시 전환하고 파티클은 생략한다.
- [ ] **Step 2: 디자인 점검** — Global Constraints의 색·타이포·모양·레이아웃 항목을 하나씩 점검한다.
  - 대비: 본문 4.5:1 이상, 큰 글자 3:1 이상. 라이트·다크 모두.
  - 터치 영역 44px, safe-area, 데스크톱 가운데 정렬
- [ ] **Step 3: 브라우저 확인** — 375px과 430px 폭에서 라이트·다크로 홈·카드·퀴즈 피드백·결과·완료·기록 화면 스크린샷을 찍어 살펴본다. DevTools에서 reduced motion을 에뮬레이트해 애니메이션이 꺼지는지 확인한다.
- [ ] **Step 4: Commit** — `git add -A && git commit -m "style: 모션, 다크 모드, 디자인 다듬기"`

---

### Task 11: PWA·오프라인

**Files:**
- Create: `manifest.webmanifest`, `sw.js`, `scripts/make-icons.js`, `icons/*.png`
- Modify: `package.json`(`"icons": "node scripts/make-icons.js"`)

- [ ] **Step 1: 아이콘**
  - `scripts/make-icons.js`는 `node:zlib`로 PNG를 직접 인코딩한다(4× 슈퍼샘플링으로 안티앨리어싱).
  - 그림: 강조색 배경에 흰색 기하 마크(겹친 카드 2장). 글자는 넣지 않는다.
  - 출력: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`(마크가 중앙 80% 안전 영역 안), `apple-touch-icon.png`(180)
  - `npm run icons`로 만든 뒤 Read 도구로 PNG를 열어 눈으로 확인한다.
- [ ] **Step 2: `manifest.webmanifest`**
  - `name "토익 단어 500"`, `short_name "토익단어"`, `lang "ko"`
  - `start_url "./"`, `scope "./"`, `display "standalone"`
  - `background_color`·`theme_color`는 라이트 배경색
  - icons: 192, 512(`any`), maskable 512(`maskable`)
- [ ] **Step 3: `sw.js`**
  - `const VERSION = 'v1'`(배포마다 올린다)
  - install: 앱 파일 목록을 캐시하고 `skipWaiting()`. 목록에는 `./`, `./index.html`, `./styles.css`, `./app.js`, `./js/**` 각 파일, `./manifest.webmanifest`, 아이콘이 들어간다.
  - activate: 이전 버전 캐시를 지우고 `clients.claim()`. 페이지를 강제로 새로고침하지 않는다. 새 버전은 다음 실행 때 적용된다.
  - fetch
    - 같은 출처 `.md`: `cache: 'no-cache'`로 network-first. 성공하면 캐시를 갱신하고, 실패하면 캐시를 쓴다.
    - 같은 출처 그 밖의 파일: cache-first(`ignoreSearch`), 없으면 네트워크로 받는다.
    - navigation 요청이 실패하면 `./index.html`을 돌려준다.
    - `cdn.jsdelivr.net`, `fonts.googleapis.com`, `fonts.gstatic.com`: `fonts-v1` 캐시에 cache-first(처음 받을 때 저장)
- [ ] **Step 4: 브라우저 확인**
  - DevTools Application 탭: manifest에 오류가 없는지, SW가 activated인지
  - Network를 Offline으로 바꾸고 새로고침 → 앱과 단어가 뜨고 폰트가 유지되는지, 퀴즈가 진행되는지
  - 온라인에서 md의 뜻 하나를 고치고 새로고침 → 바로 반영되는지(확인 후 원복)
- [ ] **Step 5: 전체 테스트** — `npm test` → 전체 PASS
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: PWA 매니페스트, 아이콘, 오프라인 service worker"`

---

### Task 12: GitHub Pages 배포·안내

**Files:**
- Modify: `sw.js`(VERSION 확인)

- [ ] **Step 1: 저장소 생성·푸시** — `gh repo create toeic-vocab --public --source . --remote origin --push`
- [ ] **Step 2: Pages 켜기** — `gh api -X POST repos/<login>/toeic-vocab/pages -f build_type=legacy -f "source[branch]=main" -f "source[path]=/"`
- [ ] **Step 3: 빌드 대기** — `gh api repos/<login>/toeic-vocab/pages/builds/latest --jq .status`가 `built`가 될 때까지 Monitor로 기다린다.
- [ ] **Step 4: 실제 URL 확인** — `https://<login>.github.io/toeic-vocab/`를 Chrome 390px로 연다.
  - 홈이 뜨는지
  - 콘솔에 에러가 없는지
  - md가 200으로 오는지
  - manifest와 SW가 등록되는지
  - 1일차 시작 → 카드 → 퀴즈 1문제까지 진행되는지
- [ ] **Step 5: 사용자에게 한국어로 보고**
  - 최종 URL
  - 홈 화면 추가 방법
    - iPhone Safari: 공유 버튼 → `홈 화면에 추가`
    - Android Chrome: ⋮ 메뉴 → `홈 화면에 추가` 또는 `앱 설치`
  - 주의 사항
    - iPhone은 홈 화면 앱과 Safari 탭의 저장 공간이 따로라서, 항상 홈 화면 아이콘으로 열어야 한다.
    - 폰을 바꾸거나 브라우저 데이터를 지우기 전에 설정 → 백업 내보내기를 해 둔다.
    - md를 고친 뒤 푸시하면 다음 실행 때 반영된다.
