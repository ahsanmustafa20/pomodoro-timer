/*
  File responsibility: DOM rendering, accessibility-friendly updates, and user interactions.
*/

import { getTodayKey } from './storage.js';

export function createUi(controls) {
  const dom = {
    modeLabel: document.getElementById('modeLabel'),
    timeDisplay: document.getElementById('timeDisplay'),
    statusText: document.getElementById('statusText'),
    startPauseButton: document.getElementById('startPauseButton'),
    pauseButton: document.getElementById('pauseButton'),
    resumeButton: document.getElementById('resumeButton'),
    resetButton: document.getElementById('resetButton'),
    focusLength: document.getElementById('focusLength'),
    breakLength: document.getElementById('breakLength'),
    completedCount: document.getElementById('completedCount'),
    historyList: document.getElementById('historyList'),
    notificationSound: document.getElementById('notificationSound'),
  };

  dom.startPauseButton.addEventListener('click', () => controls.startTimer());
  dom.pauseButton.addEventListener('click', () => controls.pauseTimer());
  dom.resumeButton.addEventListener('click', () => controls.resumeTimer());
  dom.resetButton.addEventListener('click', () => controls.resetTimer());

  return {
    renderTimer(state) {
      dom.modeLabel.textContent = state.mode === 'focus' ? 'Focus' : 'Break';
      dom.timeDisplay.textContent = formatDuration(state.remainingSeconds);
      dom.startPauseButton.textContent = 'Start';
      dom.startPauseButton.disabled = state.isRunning;
      dom.pauseButton.disabled = !state.isRunning;
      dom.resumeButton.disabled = state.isRunning || state.remainingSeconds === state.focusDuration;
      dom.resetButton.disabled = false;
      dom.statusText.textContent = state.mode === 'focus'
        ? (state.isRunning ? 'Focus session in progress. Stay on task.' : 'Ready to begin a focus session.')
        : (state.isRunning ? 'Break in progress. Take a quick reset.' : 'Ready for a break.');
      dom.focusLength.textContent = formatShortDuration(state.focusDuration);
      dom.breakLength.textContent = formatShortDuration(state.breakDuration);
    },

    renderHistory(history) {
      const todayKey = getTodayKey();
      const todayEntries = history.filter((entry) => entry.date === todayKey);

      dom.completedCount.textContent = String(todayEntries.length);
      dom.historyList.innerHTML = '';

      if (todayEntries.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'history__empty';
        emptyItem.textContent = 'No focus sessions completed today yet.';
        dom.historyList.append(emptyItem);
        return;
      }

      todayEntries.forEach((entry, index) => {
        const item = document.createElement('li');
        const label = document.createElement('span');
        label.textContent = `Session ${todayEntries.length - index}`;
        const time = document.createElement('span');
        time.textContent = entry.timeLabel;
        item.append(label, time);
        dom.historyList.append(item);
      });
    },

    playNotification() {
      dom.notificationSound.currentTime = 0;
      const promise = dom.notificationSound.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {});
      }
    },

  };
}

function formatDuration(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function formatShortDuration(totalSeconds) {
  return `${Math.round(totalSeconds / 60)} min`;
}
