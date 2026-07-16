// ENGINE ORCHESTRATOR — the single entry point to the 3D engine.
//
// This is the ONLY file React is ever allowed to import from the
// engine. `createEngine(canvas)` builds and returns a SceneEngine;
// `engine.destroy()` tears it down. React never touches anything
// inside SceneEngine directly.
//
// Rules:
// - Plain TypeScript only. No React imports, no hooks, no JSX — ever.
//   React must never drive the animation loop or hold per-frame state.
// - Client-only: `import 'client-only'` below fails the build if this
//   file is ever imported from server code.
//
// Dev-helper blocks are marked below. To remove a helper: delete its
// construct/enable line, its field, and its update()/disable() line —
// the persistent scene (renderer, camera, resize, render loop) keeps
// working exactly as before.

import "client-only";
import * as THREE from "three";
import { createPerspectiveCamera } from "./camera";
import { RenderLoop } from "./loop";
import { ViewportController } from "./controller";
import { addDebugGrid, removeDebugGrid, DevFlyCameraController } from "./debug";

export class SceneEngine {
  private _canvas: HTMLCanvasElement;
  public readonly scene: THREE.Scene;
  private _renderer: THREE.WebGLRenderer | null = null;
  private _camera: THREE.PerspectiveCamera | null = null;
  private _loop: RenderLoop | null = null;
  private _viewportController: ViewportController | null = null;

  // ---- DEV HELPERS (temporary) ----
  private _debugGrid: THREE.GridHelper | null = null;
  private _devCameraController: DevFlyCameraController | null = null;
  // ---- END DEV HELPERS ----

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this.scene = new THREE.Scene();
  }

  public init(): void {
    this._renderer = new THREE.WebGLRenderer({
      canvas: this._canvas,
      antialias: true,
    });
    this._camera = createPerspectiveCamera(
      this._canvas.clientWidth / this._canvas.clientHeight,
    );

    this._viewportController = new ViewportController(
      this._renderer,
      this._camera,
      this._canvas,
    );
    this._viewportController.enable();

    // ---- DEV HELPERS (temporary) — comment out this block to disable ----
    this._debugGrid = addDebugGrid(this.scene);
    this._devCameraController = new DevFlyCameraController(
      this._camera,
      this._renderer.domElement,
    );
    this._devCameraController.enable();
    // ---- END DEV HELPERS ----

    this._loop = new RenderLoop((delta) => {
      this._devCameraController?.update(delta); // DEV HELPER — remove with block above
      this._renderer!.render(this.scene, this._camera!);
    });
    this._loop.start();
  }

  public destroy(): void {
    this._loop?.destroy();
    this._viewportController?.disable();

    // ---- DEV HELPERS (temporary) — comment out this block to disable ----
    this._devCameraController?.disable();
    if (this._debugGrid) removeDebugGrid(this.scene, this._debugGrid);
    // ---- END DEV HELPERS ----

    // forceContextLoss (not just dispose) matters here: React Strict Mode
    // runs every effect twice in dev (mount -> cleanup -> mount), so two
    // SceneEngine instances get created back-to-back on the same canvas.
    // dispose() alone frees GPU-side caches but doesn't guarantee the
    // WebGL context itself is released before the next init() requests
    // a new one — forcing it avoids "too many active WebGL contexts"
    // warnings after repeated dev remounts.
    this._renderer?.forceContextLoss();
    this._renderer?.dispose();
  }
}

export function createEngine(canvas: HTMLCanvasElement): SceneEngine {
  const engine = new SceneEngine(canvas);
  engine.init();
  return engine;
}
