// DEV HELPER — temporary origin/base-plane grid, purely for seeing
// what's where during development. Not part of the persistent scene.
//
// To remove: delete the two call sites in core.ts (addDebugGrid /
// removeDebugGrid) — this file can then be deleted too.

import * as THREE from "three";

const GRID_SIZE = 200;
const GRID_DIVISIONS = 40;

export function addDebugGrid(scene: THREE.Scene): THREE.GridHelper {
  const grid = new THREE.GridHelper(GRID_SIZE, GRID_DIVISIONS);
  scene.add(grid);
  return grid;
}

export function removeDebugGrid(
  scene: THREE.Scene,
  grid: THREE.GridHelper,
): void {
  scene.remove(grid);
  grid.dispose();
}
