// CAMERA — builds the persistent scene camera.
//
// Stateless builder (RULE TS-D-01/03): nothing here needs to remember
// state after construction, so a function is correct — not a class.
// Stage 4 will add a separate scroll-driven path system that reads and
// writes this camera's transform; this module only ever constructs it.

import * as THREE from "three";

const DEFAULT_FOV = 60;
const DEFAULT_NEAR = 0.1;
// Sea's far corners sit ~7071 units out (half-diagonal of the current
// 10000x10000 sea — see materials/Sea.ts SEA_WORLD_SIZE), plus the
// camera itself sits off-origin — comfortable margin past both so the
// far corners never clip (that clipping previously showed up as
// wedge-shaped gaps at the horizon, easy to mistake for a geometry bug).
const DEFAULT_FAR = 9000;
// Elevated establishing shot sized to frame the full 1000-unit island
// with headroom, not the tight close-up tuned for the old 40-unit scale.
const DEFAULT_CAMERA_POSITION = new THREE.Vector3(0, 500, 1300);

export function createPerspectiveCamera(
  aspect: number,
): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(
    DEFAULT_FOV,
    aspect,
    DEFAULT_NEAR,
    DEFAULT_FAR,
  );
  camera.position.copy(DEFAULT_CAMERA_POSITION);
  camera.lookAt(0, 0, 0);
  return camera;
}
