/*
  File responsibility: localStorage persistence for timer state and daily history.
*/

const STORAGE_KEYS = {
  timerState: 'pomodoro.timerState',
  history: 'pomodoro.history',
};

export function loadTimerState() {
  return readJson(STORAGE_KEYS.timerState, null);
}

export function saveTimerState(state) {
  writeJson(STORAGE_KEYS.timerState, state);
}

export function loadDailyHistory() {
  return readJson(STORAGE_KEYS.history, []);
}

export function saveDailyHistory(history) {
  writeJson(STORAGE_KEYS.history, history);
}

export function appendHistoryEntry(entry) {
  const history = loadDailyHistory();
  history.unshift(entry);
  saveDailyHistory(history.slice(0, 20));
  return history.slice(0, 20);
}

export function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function readJson(key, fallbackValue) {
  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}
