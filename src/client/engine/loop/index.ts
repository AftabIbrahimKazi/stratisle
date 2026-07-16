// LOOP — the render/animation loop.
//
// Owns requestAnimationFrame + delta-time state and lifecycle
// (RULE TS-D-02: state persists, start/stop/destroy over time), so
// this is a class, not a function. Nothing else in the engine calls
// requestAnimationFrame directly (RULE TS-CL-01: single responsibility).
//
// Naming note: "Loop" is not in the coding-standards approved class
// suffix table (Engine/Manager/Controller/Animation/Scene/Router/
// Transition/Loader/Observer) — flagged for the developer, no suffix
// there fits a per-frame ticker better than the term everyone already
// uses for this exact role.

const MAX_DELTA_SECONDS = 0.1;

export type LoopTickCallback = (delta: number) => void;

export class RenderLoop {
  private _callback: LoopTickCallback;
  private _isRunning = false;
  private _lastTimestamp: number | null = null;
  private _frameId: number | null = null;

  constructor(callback: LoopTickCallback) {
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
    const rawDelta = (timestamp - lastTimestamp) / 1000;
    const delta = Math.min(rawDelta, MAX_DELTA_SECONDS);
    this._lastTimestamp = timestamp;
    this._callback(delta);
    this._frameId = requestAnimationFrame(this._onFrame);
  };
}
