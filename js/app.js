/*
  File responsibility: App bootstrap, module wiring, and persistence synchronization.
*/

import { PomodoroTimer } from './timer.js';
import { appendHistoryEntry, getTodayKey, loadDailyHistory, loadTimerState, saveTimerState } from './storage.js';
import { createUi } from './ui.js';

const ui = createUi({
  startTimer,
  pauseTimer,
  resumeTimer,
  resetTimer,
  updateDurations,
});

const timer = new PomodoroTimer({
  onTick: handleTimerTick,
  onModeChange: handleModeChange,
  onSessionComplete: handleSessionComplete,
});

let latestHistory = loadDailyHistory();

bootstrap();

// attach keyboard shortcuts after bootstrap
setupKeyboardShortcuts();

function bootstrap() {
  const savedState = loadTimerState();

  if (savedState) {
    timer.hydrate(savedState);
  } else {
    ui.renderTimer(timer.getState());
  }

  ui.renderHistory(latestHistory);
  syncTimerState();
}

function startTimer() {
  timer.start();
  syncTimerState();
}

function resetTimer() {
  timer.reset();
  syncTimerState();
}

function pauseTimer() {
  timer.pause();
  syncTimerState();
}

function resumeTimer() {
  timer.start();
  syncTimerState();
}

function updateDurations({ focusMinutes, breakMinutes }) {
  timer.setDurations({
    focusDuration: focusMinutes * 60,
    breakDuration: breakMinutes * 60,
  });
  syncTimerState();
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ignore when typing in form fields or editable regions
    const active = document.activeElement;
    if (!active) return;
    const isTyping = active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable;
    if (isTyping) return;

    // Use standard codes where possible and fallback to key
    const code = e.code || '';
    const key = (e.key || '').toLowerCase();

    // Space toggles start/pause
    if (code === 'Space' || key === ' ') {
      e.preventDefault();
      if (timer.isRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
      return;
    }

    if (key === 'p') {
      pauseTimer();
      return;
    }

    if (key === 'r') {
      resetTimer();
      return;
    }

    if (key === 's') {
      startTimer();
      return;
    }
  });
}

function handleTimerTick(state) {
  ui.renderTimer(state);
  syncTimerState();
}

function handleModeChange() {
  ui.renderTimer(timer.getState());
  syncTimerState();
}

function handleSessionComplete(mode) {
  ui.playNotification();

  if (mode === 'focus') {
    const completedAt = new Date();
    latestHistory = appendHistoryEntry({
      mode: 'focus',
      date: getTodayKey(completedAt),
      completedAt: completedAt.toISOString(),
      duration: timer.getState().focusDuration,
    });

    ui.renderHistory(latestHistory);
    ui.announce('Completed focus session. Starting break.');
  }
}

function syncTimerState() {
  saveTimerState(timer.getState());
}
