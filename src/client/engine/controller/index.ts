// CONTROLLER — ViewportController: keeps the renderer and camera in
// sync with the canvas's on-screen size. This is core, permanent
// engine behaviour (not a dev helper) — every stage needs a correctly
// sized render target.
//
// Future controllers (scroll progress for Stage 4, swipe for Stage 5)
// join this folder as additional named files, same pattern: receive
// typed refs via constructor (RULE TS-CT-01), never own the scene.

import * as THREE from "three";

const MAX_PIXEL_RATIO = 2;

export class ViewportController {
  private _renderer: THREE.WebGLRenderer;
  private _camera: THREE.PerspectiveCamera;
  private _canvas: HTMLCanvasElement;

  constructor(
    renderer: THREE.WebGLRenderer,
    camera: THREE.PerspectiveCamera,
    canvas: HTMLCanvasElement,
  ) {
    this._renderer = renderer;
    this._camera = camera;
    this._canvas = canvas;
  }

  public enable(): void {
    window.addEventListener("resize", this._onWindowResize);
    this._onWindowResize();
  }

  public disable(): void {
    window.removeEventListener("resize", this._onWindowResize);
  }

  private _onWindowResize = (): void => {
    const width = this._canvas.clientWidth;
    const height = this._canvas.clientHeight;
    this._renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO),
    );
    this._renderer.setSize(width, height, false);
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
  };
}
