// Island terrain — the heightmap displacement graph. Grid (flat plane,
// XY-local) -> SetPosition (per-vertex elevation offset) -> evaluated
// to a BufferGeometry, wrapped in a placeholder material — no texture
// yet, that's a later stage.

import { Grid, SetPosition, evaluateGraph } from "@triforge/geometry-nodes";
import * as THREE from "three";
import { type ElevationField } from "../assets";

// Exported so Sea.ts can cut the exact same footprint out of its own
// mesh — the sea must never render under the island.
export const ISLAND_WORLD_SIZE = 5000;
// Exaggerated well past the real elevation:footprint ratio (the source
// data alone would read as near-flat at this footprint) for a readable,
// cinematic silhouette. Tune to taste once seen in scene.
const MAX_ELEVATION_WORLD_UNITS = 25;

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
  dropSeaLevelTriangles(result);
  return result;
}

// Sea-level (z=0) padding around the island shares its exact y=0 plane
// with the sea plane mesh — coplanar triangles z-fight. Dropping any
// triangle whose 3 vertices are all at sea level removes that flat
// padding entirely; the island's remaining land silhouette meets the
// sea plane at its edge instead of overlapping it.
function dropSeaLevelTriangles(geometry: THREE.BufferGeometry): void {
  const index = geometry.getIndex();
  const position = geometry.getAttribute("position");
  if (!index) return;

  const keptIndices: number[] = [];
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i);
    const b = index.getX(i + 1);
    const c = index.getX(i + 2);
    const allAtSeaLevel =
      position.getZ(a) === 0 && position.getZ(b) === 0 && position.getZ(c) === 0;
    if (!allAtSeaLevel) keptIndices.push(a, b, c);
  }

  geometry.setIndex(keptIndices);
}

export function createIslandMesh(geometry: THREE.BufferGeometry): THREE.Mesh {
  const material = new THREE.MeshNormalMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2; // Grid is flat in XY; lay it flat in a Y-up scene
  return mesh;
}

// Sea.ts needs to know exactly which parts of its own footprint are
// actually land (not just "inside the island's bounding square") so it
// can cut a hole that matches the real coastline instead of the square
// — otherwise the gap between the coastline and the square's edge
// renders as neither island nor sea. Inverts the same local<->world
// mapping createIslandMesh's rotation applies (rotation.x = -PI/2 maps
// local (x,y,z) -> world (x,z,-y)), then samples the heightmap the same
// way createHeightField does.
export function isLandAtWorldPosition(
  elevation: ElevationField,
  worldX: number,
  worldZ: number,
): boolean {
  const half = ISLAND_WORLD_SIZE / 2;
  if (Math.abs(worldX) > half || Math.abs(worldZ) > half) return false;

  const { values, width, height } = elevation;
  const localX = worldX;
  const localY = -worldZ;
  const u = (localX + half) / ISLAND_WORLD_SIZE;
  const v = (localY + half) / ISLAND_WORLD_SIZE;
  const col = Math.min(width - 1, Math.max(0, Math.round(u * (width - 1))));
  const row = Math.min(height - 1, Math.max(0, Math.round(v * (height - 1))));
  const imageRow = height - 1 - row;
  const sample = values[imageRow * width + col];
  return sample > 0;
}

// Shoreline foam (Sea.ts) only needs distance within its own foam-band
// width, not a true global nearest-land distance — so this is a bounded
// ring search (8 directions, growing radius) capped at maxDistance,
// cheap enough to run per sea vertex once when the land mask loads/
// changes. Returns maxDistance for anything farther than that (i.e.
// "not near shore"), never a real unbounded distance.
const COAST_SEARCH_DIRECTIONS = 8;
const COAST_SEARCH_STEP = 20;

export function distanceToNearestLand(
  elevation: ElevationField,
  worldX: number,
  worldZ: number,
  maxDistance: number,
): number {
  if (isLandAtWorldPosition(elevation, worldX, worldZ)) return 0;

  for (let radius = COAST_SEARCH_STEP; radius <= maxDistance; radius += COAST_SEARCH_STEP) {
    for (let i = 0; i < COAST_SEARCH_DIRECTIONS; i++) {
      const angle = (i / COAST_SEARCH_DIRECTIONS) * Math.PI * 2;
      const x = worldX + Math.cos(angle) * radius;
      const z = worldZ + Math.sin(angle) * radius;
      if (isLandAtWorldPosition(elevation, x, z)) return radius;
    }
  }
  return maxDistance;
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
