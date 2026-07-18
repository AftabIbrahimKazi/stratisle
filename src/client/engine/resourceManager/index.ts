// RESOURCE MANAGER — pure teardown functions the engine's core logic
// depends on directly (called from Engine.ts, not optional).
// (RULE TS-U-01/02/03): no imports from class or controller files,
// these sit at the bottom of the dependency graph.

import type * as THREE from "three";

export function disposeMesh(scene: THREE.Scene, mesh: THREE.Mesh | null): void {
  if (!mesh) return;
  scene.remove(mesh);
  mesh.geometry.dispose();
  (mesh.material as THREE.Material).dispose(); // engine meshes always assign a single Material, never an array
}

// forceContextLoss matters in dev: React Strict Mode double-invokes
// effects (mount -> cleanup -> mount), creating two renderers back-to-
// back on the same canvas. dispose() alone doesn't guarantee the WebGL
// context itself releases before the next request, risking "too many
// active WebGL contexts" on repeated remounts.
export function disposeRenderer(renderer: THREE.WebGLRenderer): void {
  renderer.forceContextLoss();
  renderer.dispose();
}
