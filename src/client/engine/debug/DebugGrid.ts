// DEV HELPER — temporary origin/base-plane grid, purely for seeing
// what's where during development. Not part of the persistent scene.
//
// To remove: delete the two call sites in core.ts (addDebugGrid /
// removeDebugGrid) — this file can then be deleted too.

import * as THREE from "three";

// Sized to the 4000-unit map, not the old 40-unit scale — a helper
// grid smaller than the scene it's meant to orient you in is useless.
const GRID_SIZE = 4000;
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
