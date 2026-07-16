// The surrounding "map" — a low-poly flat plane far larger than the
// island, at the same sea-level baseline (y=0) the heightmap's own
// zero-elevation pixels already sit at. Free false-horizon effect: from
// a grounded camera it reads as open sea stretching into the distance.

import { Grid, evaluateGraph } from "@triforge/geometry-nodes";
import * as THREE from "three";

const SEA_PLANE_WORLD_SIZE = 10000;
const SEA_PLANE_SEGMENTS = 2;

// Flat — no displacement, so a coarse Grid (just enough verts for a
// valid quad) is all this needs; no reason to spend a dense vertex
// grid on an undetailed surface.
export function buildSeaPlaneMesh(): THREE.Mesh {
  const grid = new Grid({
    sizeX: SEA_PLANE_WORLD_SIZE,
    sizeY: SEA_PLANE_WORLD_SIZE,
    vertsX: SEA_PLANE_SEGMENTS,
    vertsY: SEA_PLANE_SEGMENTS,
  });

  const result = evaluateGraph(grid.output("Geometry"));
  if (!(result instanceof THREE.BufferGeometry)) {
    throw new Error("Sea plane graph did not evaluate to a BufferGeometry");
  }

  const material = new THREE.MeshNormalMaterial();
  const mesh = new THREE.Mesh(result, material);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}
