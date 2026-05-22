/*
  File responsibility: localStorage persistence for timer state and daily history.
*/

const STORAGE_KEYS = {
  timerState: 'pomodoro.timerState',
  history: 'pomodoro.history',
  historyDate: 'pomodoro.historyDate',
};

export function loadTimerState() {
  return readJson(STORAGE_KEYS.timerState, null);
}

export function saveTimerState(state) {
  writeJson(STORAGE_KEYS.timerState, state);
}

export function loadSessionHistory() {
  return ensureHistoryForToday();
}

export function saveSessionHistory(history) {
  const sanitizedHistory = Array.isArray(history) ? history : [];
  storeTodayDate();
  writeJson(STORAGE_KEYS.history, sanitizedHistory);
}

export function loadDailyHistory() {
  return loadSessionHistory();
}

export function saveDailyHistory(history) {
  saveSessionHistory(history);
}

export function appendHistoryEntry(entry) {
  const history = loadSessionHistory();
  const updatedHistory = [entry, ...history].slice(0, 20);
  saveSessionHistory(updatedHistory);
  return updatedHistory;
}

export function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getStoredHistoryDate() {
  return window.localStorage.getItem(STORAGE_KEYS.historyDate);
}

export function storeTodayDate(date = new Date()) {
  const todayKey = getTodayKey(date);
  window.localStorage.setItem(STORAGE_KEYS.historyDate, todayKey);
  return todayKey;
}

function ensureHistoryForToday(date = new Date()) {
  const todayKey = getTodayKey(date);
  const storedDate = getStoredHistoryDate();

  if (storedDate !== todayKey) {
    storeTodayDate(date);
    writeJson(STORAGE_KEYS.history, []);
    return [];
  }

  const history = readJson(STORAGE_KEYS.history, []);
  return Array.isArray(history) ? history : [];
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
