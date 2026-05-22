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
});

const timer = new PomodoroTimer({
  onTick: handleTimerTick,
  onModeChange: handleModeChange,
  onSessionComplete: handleSessionComplete,
});

let latestHistory = loadDailyHistory();

bootstrap();

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
    latestHistory = appendHistoryEntry({
      date: getTodayKey(),
      timeLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    ui.renderHistory(latestHistory);
  }
}

function syncTimerState() {
  saveTimerState(timer.getState());
}
