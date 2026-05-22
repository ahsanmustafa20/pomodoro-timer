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
    announcer: document.getElementById('ariaAnnouncer'),
    testSoundButton: document.getElementById('testSoundButton'),
  };

  const notification = {
    audioContext: null,
    isPrimed: false,
  };

  dom.startPauseButton.addEventListener('click', () => controls.startTimer());
  dom.pauseButton.addEventListener('click', () => controls.pauseTimer());
  dom.resumeButton.addEventListener('click', () => controls.resumeTimer());
  dom.resetButton.addEventListener('click', () => controls.resetTimer());
  dom.focusDurationInput.addEventListener('input', () => handleDurationInputChange(dom, controls));
  dom.breakDurationInput.addEventListener('input', () => handleDurationInputChange(dom, controls));
  if (dom.testSoundButton) {
    dom.testSoundButton.addEventListener('click', () => {
      playNotification().catch((err) => {
        console.error('Notification playback failed:', err);
        alert('Notification failed to play. Check console for details and ensure you interacted with the page first.');
      });
    });
  }

  const primeAudioOnGesture = () => {
    ensureAudioContext(notification);
    notification.isPrimed = true;
    window.removeEventListener('pointerdown', primeAudioOnGesture);
  };
  window.addEventListener('pointerdown', primeAudioOnGesture, { once: true });

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
      return playNotification(notification, dom.notificationSound);
    },

    announce(message) {
      if (!dom.announcer) return;
      dom.announcer.textContent = '';
      // slight delay to ensure assistive tech notices changes
      setTimeout(() => { dom.announcer.textContent = String(message); }, 50);
    },

  };
}

function formatDuration(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function playNotification(notification, notificationSound) {
  return new Promise((resolve, reject) => {
    try {
      const ctx = ensureAudioContext(notification);
      if (!ctx) {
        reject(new Error('AudioContext not available'));
        return;
      }

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // Try the audio element first, but do not depend on it.
      if (notificationSound) {
        try {
          notificationSound.pause();
          notificationSound.currentTime = 0;
          const audioPromise = notificationSound.play();
          if (audioPromise && typeof audioPromise.catch === 'function') {
            audioPromise.catch(() => {});
          }
        } catch (error) {
          console.warn('Audio element playback failed, using bell tone fallback:', error);
        }
      }

      playBellTone(ctx);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function ensureAudioContext(notification) {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) {
    return null;
  }

  if (!notification.audioContext) {
    notification.audioContext = new Ctx();
  }

  return notification.audioContext;
}

function playBellTone(ctx) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.18);

  gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.9);

  oscillator.onended = () => {
    try {
      oscillator.disconnect();
      gainNode.disconnect();
    } catch (error) {
      // ignore disconnect errors
    }
  };
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
  // Format: ✓ 25:00 focus — 3:42pm
  const check = document.createElement('span');
  check.textContent = '✓';
  check.setAttribute('aria-hidden', 'true');
  check.style.marginRight = '0.5rem';

  const dur = document.createElement('span');
  const durationSeconds = Number(entry.duration) || 0;
  dur.textContent = formatDurationShort(durationSeconds);
  dur.style.marginRight = '0.5rem';

  const mode = document.createElement('span');
  mode.textContent = entry.mode || 'focus';
  mode.style.marginRight = '0.5rem';

  const sep = document.createElement('span');
  sep.textContent = '—';
  sep.style.marginRight = '0.5rem';

  const timestamp = document.createElement('time');
  const dateValue = getEntryDate(entry);
  if (dateValue) {
    timestamp.dateTime = dateValue.toISOString();
    timestamp.textContent = formatHistoryTimestamp(dateValue);
  } else {
    timestamp.textContent = entry.timeLabel || '';
  }

  item.append(check, dur, mode, sep, timestamp);
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
  // e.g. 3:42pm (lowercase am/pm)
  const opts = { hour: 'numeric', minute: '2-digit' };
  const str = dateValue.toLocaleTimeString([], opts);
  return str.replace(/AM|PM/, (m) => m.toLowerCase());
}

function formatDurationShort(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
