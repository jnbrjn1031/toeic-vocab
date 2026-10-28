# Build a TOEIC Vocabulary Web App

## Goal

Build a personal TOEIC vocabulary app that **runs in a mobile browser with no app install**.
The word data is in `toeic-vocab-500.md` in this folder. Read that file first, understand its data format and the "학습 구조" (study structure) section, then start.

- All UI text in the app must be in **Korean**.
- Talk to me in **Korean** while you work.

---

## 1. Technical requirements

- **Static web app with no build step**: centered on `index.html`, `styles.css`, `app.js` (split into JS modules if helpful). Vanilla JS only, no frameworks or npm dependencies.
- **PWA**: `manifest.webmanifest`, a service worker, and app icons (192/512, including maskable). When added to the home screen it should open full-screen like a native app and work offline.
- **`toeic-vocab-500.md` is the single source of truth for word data**: the app fetches and parses the markdown tables at startup (cached by the service worker). If I edit words in the md file, the app must reflect it. If parsing does not yield exactly 500 words in 50 sets, show an error on screen.
- **Deployment**: GitHub Pages. Handle everything from creating the repo to deploying, then give me the final URL. Ask me if you need me to log in to GitHub.
- Use relative paths everywhere so it works under the GitHub Pages `/<repo-name>/` subpath.
- At the end, briefly explain how to **add the app to the home screen** on iPhone (Safari) and Android (Chrome).

## 2. Study schedule logic

- Follow the rule in the md file exactly: **sets studied on day d = `max(1, d-2)` through `min(50, d)`**; the new set is set d (for d ≤ 50); days 51–52 are review only with no new words; 52 days total.
- **Day number is progress-based, not calendar-based**: you only advance to the next day after finishing that day's full flow (study → quiz → review missed words). Skipping a calendar day must never skip any words.
- By default, **only one study day per calendar day**. After finishing today's session, the next study day unlocks at local midnight. Add a setting "Allow multiple study days per day" to override this.
- **Progress vs. plan**: compare the actual study day with the planned day, assuming one study day per calendar day starting from the plan start date (default 2026-10-29, editable in settings). Show "계획대로" (on track) or "N일 밀림" (N days behind) on the home screen.
- **Two exam D-day counters**: 2026-12-13 and 2026-12-27 (editable in settings).

## 3. Daily flow: Study → Quiz → Review missed words

### ① Study
- Show the day's words one card at a time. Support both swipe and buttons to move between cards.
- Card front: English word, part of speech, and a `NEW` or `복습` badge. Tap to flip; the back shows the Korean meaning and the collocation (짝꿍 표현).
- Pronunciation button using the Web Speech API (`speechSynthesis`, `en-US`). Hide the button if the browser does not support it.
- Order: words from the new set first, then the review sets.
- After the last card, show a "퀴즈 시작" button.

### ② Quiz
- Quiz every word studied that day (10/20/30 questions) in random order.
- Mix three question types, all 4-option multiple choice:
  1. Word → meaning
  2. Meaning → word
  3. Collocation fill-in-the-blank: replace the target word in its collocation with a blank and pick the right word. If the collocation does not contain the exact headword (e.g., promote → "promoted"), use type 1 or 2 instead.
- Draw distractors from the full 500-word list, preferring **the same part of speech** so they are genuinely confusing. Prepositions, conjunctions and conjunctive adverbs should draw from that combined group (like TOEIC Part 5).
- After each answer, immediately show correct/incorrect plus the correct word's meaning and collocation, then a "다음" button.
- Progress bar at the top. At the end, show a results screen: score, accuracy, and the list of missed words.

### ③ Review missed words
- Show only the missed words as cards → re-quiz only those words → repeat for any still missed. The day is complete when all are answered correctly.
- If nothing was missed, complete the day right away.
- Completion screen: a light celebration animation, today's score, and the current streak.

- If the app is closed at any point, it must **resume exactly where I left off** (current stage, card/question position, answers so far).

## 4. Saving study records

- Store everything on the device in the browser (localStorage; IndexedDB if needed). No server.
- **Per-day records**: date, study day number, sets studied, first quiz score, missed words, number of review rounds, time spent.
- **Per-word cumulative records**: times quizzed, times missed, date last missed.
- **Backup**: in settings, export all records as a JSON file and import them back (in case browser data is cleared or I switch phones).
- Full reset in settings, with a double confirmation.

## 5. Screens (4 bottom tabs + settings)

- **Home**: today's session card (study day, sets, number of new/review words, Start/Resume button), the two D-day counters, current streak, progress vs. plan, and overall progress (words learned out of 500, shown as a progress ring).
- **Records**: a calendar (studied days marked, color intensity by accuracy); tapping a date shows that day's details. A simple chart of accuracy over study days.
- **Missed words (오답노트)**: every word ever missed, sorted by miss count. Tap a word to view its card. A "오답만 퀴즈" button for free practice that does not affect progress.
- **Word list (단어장)**: all 500 words grouped by set, with search. Sets not yet studied appear dimmed.
- **Settings** (icon at top right of Home): theme (system/light/dark), plan start date, exam dates, allow multiple study days per day, backup/restore, reset.

## 6. Design

**Direction: friendly yet premium, clean and on-trend.** Avoid anything that looks like a default template.

- **Color**: warm off-white background in light mode; deep charcoal in dark mode (not pure black). Exactly one accent color (e.g., a calm deep green). Correct/incorrect colors must be clearly distinct from the accent.
- **Typography (clean, modern, trendy)**:
  - Korean text and UI: **Pretendard Variable**, loaded from the jsDelivr CDN using the dynamic-subset build.
  - English headwords and numbers (scores, D-day, counters): **Geist** from Google Fonts (fallback: Inter Tight). Headwords large, weight 600, slightly tight letter-spacing (around -0.02em).
  - Use `font-variant-numeric: tabular-nums` for numbers that change (scores, counters, timers).
  - Use only these two families. Define a clear type scale (e.g., 12/14/16/20/28/40px) with consistent weights and line heights.
  - Use `font-display: swap` and cache the font files in the service worker so they work offline.
- **Shape**: rounded cards (radius 20–24px), thin borders, soft subtle shadows, generous whitespace.
- **Motion**: card flip, smooth correct/incorrect feedback, animated progress ring, completion celebration. Keep it tasteful and respect `prefers-reduced-motion`.
- **Haptics**: a short vibration on correct/incorrect answers via `navigator.vibrate`; silently ignore on devices that don't support it.
- **Dark/light mode**: follow the system setting by default, with a manual override in settings that is saved. Manage all colors with CSS variables, and keep text contrast sufficient in both modes. Match the browser status bar color (`theme-color`) to the current mode.
- **Mobile first**: design for 375–430px widths, handle notch/home-bar safe areas, minimum 44px touch targets, primary buttons near the bottom within thumb reach. On desktop, render centered at phone width.

## 7. Work order

1. Build the md parser and schedule function first, and verify with simple tests: 500 words, 50 sets, every set appears on exactly 3 days, and the set lists for days 1, 2, 3, 50, 51 and 52.
2. The study → quiz → review flow with saving and resume (MVP).
3. Home / Records / Missed words / Word list / Settings screens.
4. Design polish, dark mode, PWA and offline support.
5. Deploy to GitHub Pages, then give me the URL and home-screen instructions.

After each step, briefly tell me what you did, and ask me whenever there is a decision I need to make.
