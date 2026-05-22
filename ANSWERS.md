# Answers

Use this file for short assessment responses or implementation notes.

## Talking Points

- The app is split into small modules to keep responsibilities clear.
- UI rendering is separated from timer state and storage.
- `localStorage` is used to restore timer progress and daily history.
- The layout is semantic, responsive, and accessible.
- The design direction stays simple and polished for a frontend assessment.

---

## Assessment Answers

1) How to run

Clone the repo, install dependencies and start a local server. Example:

```bash
git clone <repo-url>
cd pomodoro-timer
npm install
npm start
```

If you don't have a `start` script, use a simple static server during development:

```bash
npx serve .
# or
npx http-server .
```

Live demo placeholder:

https://your-project.vercel.app

2) Stack & design choices

- Stack: Vanilla HTML, CSS and ES modules (modern browsers). I kept the project dependency-free so reviewers can focus on DOM, CSS and JS fundamentals without build tooling noise.

- Why vanilla: The assessment goal is to show solid front-end fundamentals (semantic markup, DOM APIs, accessibility, state management). Using plain ES modules makes the control flow explicit and keeps feedback loops short for reviewers.

- UI/UX decisions:
	- Large central timer with responsive type (CSS `clamp()`): the timer is the primary affordance — it must be readable at a glance across devices. `clamp()` lets the font scale smoothly between mobile and desktop without media-query churn.
	- Subtle state visuals + clear affordances: I used distinct color accents for Focus vs Break and added visible `:focus-visible` styles and keyboard shortcuts to support both sighted and keyboard-first users. The tradeoff was keeping the visual language restrained so the UI remains calm — I favored clarity over heavy decorative effects.

3) Responsive & accessibility

- Mobile vs Desktop: On mobile the layout collapses to a single column — controls stretch full width and settings stack vertically for easy thumb reach. On desktop the meta panel and history sit beside/under the timer, with larger type and more whitespace for scanning.

- Accessibility improvement implemented: the main display exposes a `role="timer"` and there are `aria-live` regions for status updates; buttons and inputs have explicit labels and robust `:focus-visible` styles. Keyboard shortcuts (Space/S/P/R) are provided and disabled while typing in inputs.

- Accessibility improvement intentionally skipped: granular per-second screen-reader announcements. Announcing every second is disruptive for assistive tech; I instead used polite live regions for important state changes (start, end, mode switch). Given more time I would make announcements configurable so users can opt into more verbose feedback.

4) AI usage

- I used GitHub Copilot during the scaffold and some refactor suggestions. Typical prompts I used inside the editor were short contextual comments like "Pomodoro timer class: start, pause, reset, hydrate state" and "accessible timer aria-live example".

- What Copilot helped with: generating small boilerplate (initial `PomodoroTimer` method stubs, sample `createHistoryItem` DOM snippets, and keyboard event patterns). It expedited mechanical parts but I reviewed and edited everything — especially the state lifecycle and cleanup logic.

- What I changed from AI suggestions: Copilot sometimes emits compact patterns that assume a single execution context (e.g., not clearing intervals). I refactored those snippets into a `stopInterval()` helper, added `hydrate()` to restore state safely, and split UI, timer and storage into separate modules for clearer responsibilities.

5) Honest gap (1-day improvement)

With another day I'd add automated tests (unit tests for the timer logic with Jest + jsdom, and a small end-to-end smoke test using Playwright). Tests would catch regressions in time calculations and mode switching, and make future refactors safer — plus they'd give reviewers confidence in correctness.

---

If you want, I can trim these answers to match a specific character limit or adapt the tone for a hiring panel write-up.
