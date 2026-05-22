/*
  File responsibility: Timer state, countdown logic, and automatic mode switching.
*/

export const DEFAULT_FOCUS_DURATION_SECONDS = 25 * 60;
export const DEFAULT_BREAK_DURATION_SECONDS = 5 * 60;

export function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
  const seconds = String(safeSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export class PomodoroTimer {
  constructor({
    focusDuration = DEFAULT_FOCUS_DURATION_SECONDS,
    breakDuration = DEFAULT_BREAK_DURATION_SECONDS,
    onTick,
    onModeChange,
    onSessionComplete,
  } = {}) {
    this.settings = {
      focusDuration,
      breakDuration,
    };

    this.onTick = onTick ?? (() => {});
    this.onModeChange = onModeChange ?? (() => {});
    this.onSessionComplete = onSessionComplete ?? (() => {});

    this.mode = 'focus';
    this.isRunning = false;
    this.remainingSeconds = this.settings.focusDuration;
    this.intervalId = null;
  }

  start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.onTick(this.getState());
    this.stopInterval();
    this.intervalId = window.setInterval(() => this.tick(), 1000);
  }

  pause() {
    if (!this.isRunning) {
      return;
    }

    this.stopInterval();
    this.isRunning = false;
    this.onTick(this.getState());
  }

  reset() {
    this.stopInterval();
    this.isRunning = false;
    this.mode = 'focus';
    this.remainingSeconds = this.settings.focusDuration;
    this.onModeChange(this.mode);
    this.onTick(this.getState());
  }

  setDurations({ focusDuration, breakDuration } = {}) {
    const nextFocusDuration = normalizeDuration(focusDuration, this.settings.focusDuration);
    const nextBreakDuration = normalizeDuration(breakDuration, this.settings.breakDuration);

    this.settings.focusDuration = nextFocusDuration;
    this.settings.breakDuration = nextBreakDuration;

    if (!this.isRunning) {
      this.remainingSeconds = this.getDurationForMode(this.mode);
    }

    this.onTick(this.getState());
  }

  tick() {
    if (!this.isRunning) {
      return;
    }

    if (this.remainingSeconds <= 1) {
      this.handleCycleEnd();
      return;
    }

    this.remainingSeconds -= 1;
    this.onTick(this.getState());
  }

  handleCycleEnd() {
    const completedMode = this.mode;
    this.onSessionComplete(completedMode);

    this.mode = completedMode === 'focus' ? 'break' : 'focus';
    this.remainingSeconds = this.getDurationForMode(this.mode);
    this.onModeChange(this.mode);
    this.onTick(this.getState());
  }

  getDurationForMode(mode) {
    return mode === 'focus' ? this.settings.focusDuration : this.settings.breakDuration;
  }

  getRemainingSeconds() {
    return this.remainingSeconds;
  }

  getFormattedTime() {
    return formatTime(this.getRemainingSeconds());
  }

  getState() {
    return {
      mode: this.mode,
      isRunning: this.isRunning,
      remainingSeconds: this.getRemainingSeconds(),
      focusDuration: this.settings.focusDuration,
      breakDuration: this.settings.breakDuration,
    };
  }

  hydrate(state = {}) {
    this.settings.focusDuration = normalizeDuration(state.focusDuration, this.settings.focusDuration);
    this.settings.breakDuration = normalizeDuration(state.breakDuration, this.settings.breakDuration);
    this.mode = normalizeMode(state.mode);
    this.isRunning = Boolean(state.isRunning);
    this.remainingSeconds = Number.isFinite(state.remainingSeconds) ? Math.max(0, Math.floor(state.remainingSeconds)) : this.getDurationForMode(this.mode);

    if (!this.isRunning) {
      this.remainingSeconds = this.getDurationForMode(this.mode);
    }

    this.onModeChange(this.mode);
    this.onTick(this.getState());

    if (this.isRunning) {
      this.stopInterval();
      this.intervalId = window.setInterval(() => this.tick(), 1000);
    }
  }

  stopInterval() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

function normalizeMode(mode) {
  return mode === 'break' ? 'break' : 'focus';
}

function normalizeDuration(value, fallback) {
  const duration = Number(value);
  if (!Number.isFinite(duration) || duration < 1) {
    return fallback;
  }

  return Math.floor(duration);
}
