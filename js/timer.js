/*
  File responsibility: Timer state, countdown logic, and automatic mode switching.
*/

const DEFAULT_SETTINGS = {
  focusDuration: 25 * 60,
  breakDuration: 5 * 60,
};

export class PomodoroTimer {
  constructor({ focusDuration = DEFAULT_SETTINGS.focusDuration, breakDuration = DEFAULT_SETTINGS.breakDuration, onTick, onModeChange, onSessionComplete } = {}) {
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
    this.endsAt = null;
  }

  start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.endsAt = Date.now() + this.remainingSeconds * 1000;
    this.tick();
    this.intervalId = window.setInterval(() => this.tick(), 1000);
  }

  pause() {
    if (!this.isRunning) {
      return;
    }

    this.remainingSeconds = this.getRemainingSeconds();
    this.stopInterval();
    this.isRunning = false;
    this.endsAt = null;
    this.onTick(this.getState());
  }

  reset() {
    this.stopInterval();
    this.isRunning = false;
    this.mode = 'focus';
    this.remainingSeconds = this.settings.focusDuration;
    this.endsAt = null;
    this.onModeChange(this.mode);
    this.onTick(this.getState());
  }

  tick() {
    const remainingSeconds = this.getRemainingSeconds();

    if (remainingSeconds <= 0) {
      this.handleCycleEnd();
      return;
    }

    this.remainingSeconds = remainingSeconds;
    this.onTick(this.getState());
  }

  handleCycleEnd() {
    const completedMode = this.mode;
    this.onSessionComplete(completedMode);

    this.mode = completedMode === 'focus' ? 'break' : 'focus';
    this.remainingSeconds = this.getDurationForMode(this.mode);
    this.endsAt = Date.now() + this.remainingSeconds * 1000;
    this.onModeChange(this.mode);
    this.onTick(this.getState());
  }

  getDurationForMode(mode) {
    return mode === 'focus' ? this.settings.focusDuration : this.settings.breakDuration;
  }

  getRemainingSeconds() {
    if (!this.isRunning || this.endsAt === null) {
      return this.remainingSeconds;
    }

    return Math.max(0, Math.ceil((this.endsAt - Date.now()) / 1000));
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
    this.mode = state.mode === 'break' ? 'break' : 'focus';
    this.isRunning = Boolean(state.isRunning);
    this.remainingSeconds = Number.isFinite(state.remainingSeconds) ? state.remainingSeconds : this.getDurationForMode(this.mode);
    this.endsAt = this.isRunning ? Date.now() + this.remainingSeconds * 1000 : null;

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
