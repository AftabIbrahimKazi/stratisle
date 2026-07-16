// All engine setup logic in one file, for a single top-to-bottom read.
// Still 4 separate classes — private fields stay locked to their own
// class, same as if they were in separate files. Only Engine is
// exported; the other three are internal to this file only.

import * as THREE from "three";
import { createPerspectiveCamera } from "../camera";
import { ViewportController } from "../controller";
import { addDebugGrid, removeDebugGrid, DevFlyCameraController } from "../helperDebugFunctions";
import { loadIslandMesh, buildSeaPlaneMesh } from "../materials";
import { AnimationLoop } from "../animation-loop";
import { disposeMesh, disposeRenderer } from "../resourceManager";

const HEIGHTMAP_URL = "/assets/height-map/nicobar-heightmap-448.webp";

// Sets up renderer, camera, viewport sizing. Just setup — no loop here.
class CoreSetupManager {
  public readonly renderer: THREE.WebGLRenderer;
  public readonly camera: THREE.PerspectiveCamera;
  private _viewportController: ViewportController;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.camera = createPerspectiveCamera(canvas.clientWidth / canvas.clientHeight);
    this._viewportController = new ViewportController(this.renderer, this.camera, canvas);
  }

  public setup(): void {
    this._viewportController.enable();
  }

  public destroy(): void {
    this._viewportController.disable();
    disposeRenderer(this.renderer);
  }
}

// Owns what's actually placed in the world: sea plane + island mesh.
class WorldObjectsManager {
  private _scene: THREE.Scene;
  private _islandMesh: THREE.Mesh | null = null;
  private _islandLoadError: Error | null = null;
  private _seaPlaneMesh: THREE.Mesh | null = null;

  constructor(scene: THREE.Scene) {
    this._scene = scene;
  }

  public setup(): void {
    this._seaPlaneMesh = buildSeaPlaneMesh();
    this._scene.add(this._seaPlaneMesh);
  }

  public loadIsland(): void {
    loadIslandMesh(HEIGHTMAP_URL).then(this._onIslandLoaded, this._onIslandLoadError);
  }

  public destroy(): void {
    disposeMesh(this._scene, this._islandMesh);
    disposeMesh(this._scene, this._seaPlaneMesh);
  }

  private _onIslandLoaded = (mesh: THREE.Mesh): void => {
    this._islandMesh = mesh;
    this._scene.add(mesh);
  };

  private _onIslandLoadError = (error: unknown): void => {
    this._islandLoadError = error instanceof Error ? error : new Error(String(error));
  };
}

// Dev-only tools: origin grid + WASD/pointer-lock fly camera. Delete
// this class and its use below to strip dev tooling from a build.
class DevHelperControllerManager {
  private _scene: THREE.Scene;
  private _grid: THREE.GridHelper | null = null;
  private _flyCamera: DevFlyCameraController;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this._scene = scene;
    this._flyCamera = new DevFlyCameraController(camera, domElement);
  }

  public enable(): void {
    this._grid = addDebugGrid(this._scene);
    this._flyCamera.enable();
  }

  public disable(): void {
    this._flyCamera.disable();
    if (this._grid) removeDebugGrid(this._scene, this._grid);
  }

  public update(delta: number): void {
    this._flyCamera.update(delta);
  }
}

// Wires the three managers above together. Owns the loop itself since
// starting it needs both CoreSetupManager and DevHelperControllerManager.
export class Engine {
  private _canvas: HTMLCanvasElement;
  public readonly scene: THREE.Scene;
  private _rendering: CoreSetupManager | null = null;
  private _content: WorldObjectsManager | null = null;
  private _loop: AnimationLoop | null = null;

  // ---- DEV HELPERS (temporary) ----
  private _devTools: DevHelperControllerManager | null = null;
  // ---- END DEV HELPERS ----

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this.scene = new THREE.Scene();
  }

  public setup(): void {
    const rendering = new CoreSetupManager(this._canvas);
    rendering.setup();
    this._rendering = rendering;

    this._content = new WorldObjectsManager(this.scene);
    this._content.setup();

    // ---- DEV HELPERS (temporary) — delete this block to disable ----
    this._devTools = new DevHelperControllerManager(
      this.scene,
      rendering.camera,
      rendering.renderer.domElement,
    );
    this._devTools.enable();
    // ---- END DEV HELPERS ----

    this._loop = new AnimationLoop((delta) => {
      this._devTools?.update(delta); // DEV HELPER — delete this line with block above
      rendering.renderer.render(this.scene, rendering.camera);
    });
    this._loop.start();

    this._content.loadIsland();
  }

  public destroy(): void {
    this._loop?.destroy();
    this._devTools?.disable(); // DEV HELPER — delete with block above
    this._content?.destroy();
    this._rendering?.destroy();
  }
}
