/*
  File responsibility: DOM rendering, accessibility-friendly updates, and user interactions.
*/

import { getTodayKey } from './storage.js';

export function createUi(controls) {
  const dom = {
    timerSection: document.querySelector('.timer'),
    modeLabel: document.getElementById('modeLabel'),
    timeDisplay: document.getElementById('timeDisplay'),
    statusText: document.getElementById('statusText'),
    startPauseButton: document.getElementById('startPauseButton'),
    pauseButton: document.getElementById('pauseButton'),
    resumeButton: document.getElementById('resumeButton'),
    resetButton: document.getElementById('resetButton'),
    focusDurationInput: document.getElementById('focusDuration'),
    breakDurationInput: document.getElementById('breakDuration'),
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
  dom.focusDurationInput.addEventListener('input', () => handleDurationInputChange(dom, controls));
  dom.breakDurationInput.addEventListener('input', () => handleDurationInputChange(dom, controls));

  return {
    renderTimer(state) {
      if (dom.timerSection) {
        dom.timerSection.dataset.mode = state.mode;
        dom.timerSection.classList.toggle('timer--focus', state.mode === 'focus');
        dom.timerSection.classList.toggle('timer--break', state.mode === 'break');
        dom.timerSection.classList.toggle('timer--running', state.isRunning);
      }

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
      dom.focusDurationInput.value = String(Math.round(state.focusDuration / 60));
      dom.breakDurationInput.value = String(Math.round(state.breakDuration / 60));
      dom.focusLength.textContent = formatShortDuration(state.focusDuration);
      dom.breakLength.textContent = formatShortDuration(state.breakDuration);
    },

    renderHistory(history) {
      const todayEntries = getTodayHistoryEntries(history);

      dom.completedCount.textContent = String(todayEntries.length);
      dom.historyList.innerHTML = '';

      if (todayEntries.length === 0) {
        dom.historyList.append(createEmptyHistoryItem());
        return;
      }

      todayEntries.forEach((entry, index) => {
        dom.historyList.append(createHistoryItem(entry, index));
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

function handleDurationInputChange(dom, controls) {
  const focusMinutes = parseDurationInputValue(dom.focusDurationInput.value);
  const breakMinutes = parseDurationInputValue(dom.breakDurationInput.value);

  if (focusMinutes === null || breakMinutes === null) {
    return;
  }

  controls.updateDurations({ focusMinutes, breakMinutes });
}

function parseDurationInputValue(rawValue) {
  const minutes = Number(rawValue);

  if (!Number.isFinite(minutes) || minutes < 1) {
    return null;
  }

  return Math.floor(minutes);
}

function getTodayHistoryEntries(history) {
  const todayKey = getTodayKey();
  return history
    .filter((entry) => entry.date === todayKey && entry.mode !== 'break')
    .sort((a, b) => getEntryTimestamp(b) - getEntryTimestamp(a));
}

function createEmptyHistoryItem() {
  const emptyItem = document.createElement('li');
  emptyItem.className = 'history__empty';
  emptyItem.textContent = 'No focus sessions completed today yet.';
  return emptyItem;
}

function createHistoryItem(entry, index) {
  const item = document.createElement('li');
  const label = document.createElement('span');
  label.textContent = `Session ${index + 1}`;

  const timestamp = document.createElement('time');
  const dateValue = getEntryDate(entry);

  if (dateValue) {
    timestamp.dateTime = dateValue.toISOString();
    timestamp.textContent = formatHistoryTimestamp(dateValue);
  } else {
    timestamp.textContent = entry.timeLabel;
  }

  item.append(label, timestamp);
  return item;
}

function getEntryDate(entry) {
  if (typeof entry.completedAt === 'string') {
    const parsedDate = new Date(entry.completedAt);
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  return null;
}

function getEntryTimestamp(entry) {
  const entryDate = getEntryDate(entry);
  return entryDate ? entryDate.getTime() : 0;
}

function formatHistoryTimestamp(dateValue) {
  return dateValue.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
