// DEV HELPER — temporary developer fly-camera: WASD to move, click the
// canvas then move the mouse to look around (pointer-lock), Space/Shift
// for up/down, scroll wheel to zoom (camera FOV). For the developer to
// inspect the scene only — not part of the persistent camera system
// Stage 4 will build.
//
// To remove: delete the construct/enable call and the update()/disable()
// call sites in core.ts — this file can then be deleted too.

import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { clamp } from "../utils";

// Scaled for the 1000-4000 unit map — the old value (tuned for a
// 40-unit island) would take minutes to cross the new scene.
const MOVE_SPEED = 300;
const KEY_CODE_FORWARD = "KeyW";
const KEY_CODE_BACKWARD = "KeyS";
const KEY_CODE_LEFT = "KeyA";
const KEY_CODE_RIGHT = "KeyD";
const KEY_CODE_UP = "Space";
const KEY_CODE_DOWN = "ShiftLeft";
const MIN_FOV = 10;
const MAX_FOV = 90;
const ZOOM_SPEED = 0.05;

export class DevFlyCameraController {
  private _camera: THREE.PerspectiveCamera;
  private _domElement: HTMLElement;
  private _pointerLock: PointerLockControls;
  private _isMovingForward = false;
  private _isMovingBackward = false;
  private _isMovingLeft = false;
  private _isMovingRight = false;
  private _isMovingUp = false;
  private _isMovingDown = false;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this._camera = camera;
    this._domElement = domElement;
    this._pointerLock = new PointerLockControls(camera, domElement);
  }

  public enable(): void {
    this._domElement.addEventListener("click", this._onClick);
    this._domElement.addEventListener("wheel", this._onWheel, {
      passive: false,
    });
    document.addEventListener("keydown", this._onKeyDown);
    document.addEventListener("keyup", this._onKeyUp);
  }

  public disable(): void {
    this._domElement.removeEventListener("click", this._onClick);
    this._domElement.removeEventListener("wheel", this._onWheel);
    document.removeEventListener("keydown", this._onKeyDown);
    document.removeEventListener("keyup", this._onKeyUp);
    this._pointerLock.dispose();
  }

  public update(delta: number): void {
    const distance = MOVE_SPEED * delta;
    if (this._isMovingForward) this._pointerLock.moveForward(distance);
    if (this._isMovingBackward) this._pointerLock.moveForward(-distance);
    if (this._isMovingRight) this._pointerLock.moveRight(distance);
    if (this._isMovingLeft) this._pointerLock.moveRight(-distance);
    if (this._isMovingUp) this._camera.position.y += distance;
    if (this._isMovingDown) this._camera.position.y -= distance;
  }

  private _onClick = (): void => {
    this._pointerLock.lock();
  };

  private _onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    const nextFov = this._camera.fov + event.deltaY * ZOOM_SPEED;
    this._camera.fov = clamp(nextFov, MIN_FOV, MAX_FOV);
    this._camera.updateProjectionMatrix();
  };

  private _onKeyDown = (event: KeyboardEvent): void => {
    this._setMovementState(event.code, true);
  };

  private _onKeyUp = (event: KeyboardEvent): void => {
    this._setMovementState(event.code, false);
  };

  private _setMovementState(code: string, isActive: boolean): void {
    switch (code) {
      case KEY_CODE_FORWARD:
        this._isMovingForward = isActive;
        break;
      case KEY_CODE_BACKWARD:
        this._isMovingBackward = isActive;
        break;
      case KEY_CODE_LEFT:
        this._isMovingLeft = isActive;
        break;
      case KEY_CODE_RIGHT:
        this._isMovingRight = isActive;
        break;
      case KEY_CODE_UP:
        this._isMovingUp = isActive;
        break;
      case KEY_CODE_DOWN:
        this._isMovingDown = isActive;
        break;
      default:
        break;
    }
  }
}
