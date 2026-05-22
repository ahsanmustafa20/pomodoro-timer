# Pomodoro Timer

A clean vanilla HTML, CSS, and JavaScript Pomodoro Timer starter project for frontend assessment practice.

## Features

- Focus and break modes
- Start, pause, resume, and reset controls
- Countdown display in `mm:ss`
- Automatic session switching
- Audible cycle notification
- Daily focus session history
- `localStorage` persistence
- Responsive, accessible dark UI

## Project Structure

- `index.html` - App shell and semantic structure
- `css/style.css` - Global styling and responsive layout
- `js/app.js` - App bootstrap and module wiring
- `js/timer.js` - Timer logic and mode transitions
- `js/storage.js` - `localStorage` helpers
- `js/ui.js` - DOM rendering and user interactions
- `assets/bell.mp3` - Notification sound asset

## Notes

This starter uses only vanilla browser APIs and native ES modules. It is intentionally lightweight and realistic for an intermediate frontend assessment.

---

## Overview

This is a compact Pomodoro timer built with plain HTML, CSS, and JavaScript. It demonstrates common frontend patterns (modular ES modules, separation of concerns for UI/state/storage), a responsive layout, and basic accessibility features. It's intended as a small assessment app for a frontend engineer at a beginner-to-intermediate level.

## Features

- Focus and Break modes with configurable durations
- Start / Pause / Resume / Reset controls
- Automatic mode switching when a session completes
- Audible notification at the end of a session (`assets/bell.mp3` — replace with your preferred sound)
- Daily session history persisted to `localStorage` (resets each calendar day)
- Keyboard shortcuts and visible focus states for better accessibility
- Responsive layout that works on mobile and desktop

## Quick start

1. Clone the repo and change into the project folder:

```bash
git clone <repo-url>
cd pomodoro-timer
```

2. Install dependencies (if the project is wrapped with a simple dev wrapper):

```bash
npm install
```

3. Start a local dev server:

```bash
npm start
```

Notes:
- If there is no `package.json` in this repo, you can run a quick static server with the VS Code Live Server extension or via `npx serve .` or `npx http-server`.
- `npm start` is expected to run a small static server (for example `npx serve -s . -l 3000`) when present.

## Local development tips

- Open `index.html` in your browser via a local server (file:// won't work for module imports).
- Use the browser console to see any runtime logs. The code is modular and lives under `js/`.
- Replace `assets/bell.mp3` with a short sound file you prefer.

## Keyboard shortcuts

- Space: toggle start / pause
- S: start
- P: pause
- R: reset

These shortcuts are intentionally simple and are disabled while typing in inputs.

## Accessibility

- The timer exposes the main display via ARIA roles and live regions to announce state changes.
- Buttons and inputs have visible focus styles (`:focus-visible`) and labels.
- The UI aims for readable contrast; if you change colors, re-check contrast ratios.

## Deployment / Live demo

This project can be deployed to Vercel (or any static host).

Quick Vercel deploy:

1. Install the Vercel CLI or use the Vercel web UI.
2. From the project folder run:

```bash
npx vercel --prod
```

Or connect your GitHub repo to Vercel and enable automatic deployments.

Live demo:

https://pomodoro-timer-a1j8s9ci6-ahsanmustafa20s-projects.vercel.app/

## What to customize for assessment

- Swap the placeholder audio file with a short bell.
- Tweak `css/style.css` variables for brand colors while keeping contrast in mind.
- Add tests or a small build script if you want to demonstrate build tooling.

## Contributing

This is a small starter project — open a PR or create an issue if you find a bug or want a minor enhancement.

## License

MIT — feel free to adapt for assessments, demos, or learning.

