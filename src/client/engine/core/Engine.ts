// All engine setup logic in one file, for a single top-to-bottom read.
// Still 4 separate classes — private fields stay locked to their own
// class, same as if they were in separate files. Only Engine is
// exported; the other three are internal to this file only.

import * as THREE from "three";
import { createPerspectiveCamera } from "../camera";
import { ViewportController } from "../controller";
import { addDebugGrid, removeDebugGrid, DevFlyCameraController } from "../helperDebugFunctions";
import { buildIslandGeometry, createIslandMesh, Sea } from "../materials";
import { loadElevationField, type ElevationField } from "../assets";
import { computeSunDirection, setupSkyEnvironment, followCamera } from "../hdr";
import type { Sky } from "three/examples/jsm/objects/Sky.js";
import { createSunLight, createAmbientFill } from "../lighting";
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
    // The procedural sky (hdr/) outputs raw radiance values, often >1 —
    // without tone mapping that reads as blown-out white instead of
    // blue sky. Standard pairing for Sky/PMREM setups.
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.5;
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

// Owns what's actually placed in the world: sea + island mesh.
class WorldObjectsManager {
  private _scene: THREE.Scene;
  private _islandMesh: THREE.Mesh | null = null;
  private _islandLoadError: Error | null = null;
  private _sea: Sea | null = null;

  constructor(scene: THREE.Scene) {
    this._scene = scene;
  }

  public setup(): void {
    this._sea = new Sea();
    this._scene.add(this._sea.mesh);
  }

  // Loads the elevation field once and shares it between the island
  // mesh and the sea's land-mask cutout — the sea otherwise only knows
  // the island's bounding square, not its real coastline (see Sea.ts
  // setLandMask).
  public loadIsland(): void {
    loadElevationField(HEIGHTMAP_URL).then(this._onElevationLoaded, this._onIslandLoadError);
  }

  public update(delta: number): void {
    this._sea?.update(delta);
  }

  public destroy(): void {
    disposeMesh(this._scene, this._islandMesh);
    if (this._sea) {
      this._scene.remove(this._sea.mesh);
      this._sea.dispose();
    }
  }

  // Split in two: the sea's land-mask refinement is cheap (a per-vertex
  // point-in-bounds check against data already in memory) so it applies
  // the instant elevation data is available. buildIslandGeometry is not
  // cheap — it walks the full 448x448 heightmap (~200k vertices) through
  // Triforge's SetPosition + dropSeaLevelTriangles synchronously — so
  // that part is deferred one frame, same reasoning as Sea's own
  // detail-layer deferral: keeps it from stacking synchronously in the
  // same tick the network fetch/decode happens to resolve in.
  private _onElevationLoaded = (elevation: ElevationField): void => {
    this._sea?.setLandMask(elevation);

    requestAnimationFrame(() => {
      const geometry = buildIslandGeometry(elevation);
      const mesh = createIslandMesh(geometry);
      this._islandMesh = mesh;
      this._scene.add(mesh);
    });
  };

  private _onIslandLoadError = (error: unknown): void => {
    this._islandLoadError = error instanceof Error ? error : new Error(String(error));
  };
}

// Sky dome + sun/ambient lights. Sun direction is computed once here
// and shared between hdr's sky and lighting's directional light so
// they always agree on where the sun sits (see hdr/index.ts).
class EnvironmentManager {
  private _scene: THREE.Scene;
  private _renderer: THREE.WebGLRenderer;
  private _sky: Sky | null = null;

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    this._scene = scene;
    this._renderer = renderer;
  }

  public setup(): void {
    const sunDirection = computeSunDirection();
    this._sky = setupSkyEnvironment(this._renderer, this._scene, sunDirection);
    this._scene.add(createSunLight(sunDirection));
    this._scene.add(createAmbientFill());
  }

  public update(cameraPosition: THREE.Vector3): void {
    if (this._sky) followCamera(this._sky, cameraPosition);
  }
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
  private _environment: EnvironmentManager | null = null;
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

    const environment = new EnvironmentManager(this.scene, rendering.renderer);
    environment.setup();
    this._environment = environment;

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
      this._content?.update(delta);
      this._environment?.update(rendering.camera.position);
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
