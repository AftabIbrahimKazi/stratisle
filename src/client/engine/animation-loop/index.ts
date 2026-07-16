// ANIMATION LOOP — owns requestAnimationFrame + delta-time state and
// lifecycle (RULE TS-D-02: state persists, start/stop/destroy over
// time), so this is a class, not a function. Nothing else in the
// engine calls requestAnimationFrame directly (RULE TS-CL-01: single
// responsibility).
//
// Deliberately knows nothing about scene/camera/renderer — it only
// calls the callback it's given with a clamped delta. Assembling
// "what happens on a frame" (e.g. calling renderer.render) is the
// caller's job, not this module's.

const MAX_DELTA_SECONDS = 0.1;

type AnimationLoopTickCallback = (delta: number) => void;

export class AnimationLoop {
  private _callback: AnimationLoopTickCallback;
  private _isRunning = false;
  private _lastTimestamp: number | null = null;
  private _frameId: number | null = null;

  constructor(callback: AnimationLoopTickCallback) {
    this._callback = callback;
  }

  public start(): void {
    if (this._isRunning) return;
    this._isRunning = true;
    this._lastTimestamp = null;
    this._frameId = requestAnimationFrame(this._onFrame);
  }

  public stop(): void {
    this._isRunning = false;
    if (this._frameId !== null) {
      cancelAnimationFrame(this._frameId);
      this._frameId = null;
    }
  }

  public destroy(): void {
    this.stop();
  }

  private _onFrame = (timestamp: number): void => {
    if (!this._isRunning) return;
    const lastTimestamp = this._lastTimestamp ?? timestamp;
    const delta = Math.min((timestamp - lastTimestamp) / 1000, MAX_DELTA_SECONDS);
    this._lastTimestamp = timestamp;
    this._callback(delta);
    this._frameId = requestAnimationFrame(this._onFrame);
  };
}
