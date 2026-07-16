// Island terrain — the heightmap displacement graph. Grid (flat plane,
// XY-local) -> SetPosition (per-vertex elevation offset) -> evaluated
// to a BufferGeometry, wrapped in a placeholder material — no texture
// yet, that's a later stage.

import { Grid, SetPosition, evaluateGraph } from "@triforge/geometry-nodes";
import * as THREE from "three";
import { loadElevationField, type ElevationField } from "../assets";

const ISLAND_WORLD_SIZE = 5000;
// Exaggerated well past the real elevation:footprint ratio (the source
// data alone would read as near-flat at this footprint) for a readable,
// cinematic silhouette. Tune to taste once seen in scene.
const MAX_ELEVATION_WORLD_UNITS = 115;

export function buildIslandGeometry(
  elevation: ElevationField,
): THREE.BufferGeometry {
  const grid = new Grid({
    sizeX: ISLAND_WORLD_SIZE,
    sizeY: ISLAND_WORLD_SIZE,
    vertsX: elevation.width,
    vertsY: elevation.height,
  });

  const displaced = new SetPosition({
    geometry: grid.output("Geometry"),
    offset: createHeightField(elevation),
  });

  const result = evaluateGraph(displaced.output("Geometry"));
  if (!(result instanceof THREE.BufferGeometry)) {
    throw new Error("Island geometry graph did not evaluate to a BufferGeometry");
  }
  return result;
}

export function createIslandMesh(geometry: THREE.BufferGeometry): THREE.Mesh {
  const material = new THREE.MeshNormalMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2; // Grid is flat in XY; lay it flat in a Y-up scene
  return mesh;
}

// Composed load -> build -> mesh, so the orchestrator (core.ts) makes
// one call instead of defining the sequencing itself.
export async function loadIslandMesh(url: string): Promise<THREE.Mesh> {
  const elevation = await loadElevationField(url);
  const geometry = buildIslandGeometry(elevation);
  return createIslandMesh(geometry);
}

// Grid fills vertices row-major (row 0 first). Canvas image data is
// also row-major but with row 0 at the image's TOP — flipping here
// keeps the island reading right-side-up instead of mirrored.
function createHeightField(
  elevation: ElevationField,
): (index: number) => [number, number, number] {
  const { values, width, height } = elevation;

  return (index: number): [number, number, number] => {
    const col = index % width;
    const row = Math.floor(index / width);
    const imageRow = height - 1 - row;
    const sample = values[imageRow * width + col];
    const z = (sample / 255) * MAX_ELEVATION_WORLD_UNITS;
    return [0, 0, z];
  };
}
