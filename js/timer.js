export class Timer {
  constructor() {
    this._interval = null;
    this._remaining = 0;
    this._startTs = 0;
  }

  start(durationSeconds, onTick = () => {}, onEnd = () => {}) {
    this.stop();
    this._remaining = durationSeconds;
    this._startTs = Date.now();
    onTick(this._remaining);
    this._interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this._startTs) / 1000);
      const rem = Math.max(0, durationSeconds - elapsed);
      this._remaining = rem;
      onTick(rem);
      if (rem <= 0) {
        this.stop();
        onEnd();
      }
    }, 250);
  }

  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  get remaining() {
    return this._remaining;
  }

  static format(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  }
}