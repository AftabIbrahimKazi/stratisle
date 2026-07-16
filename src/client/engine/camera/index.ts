// CAMERA — builds the persistent scene camera.
//
// Stateless builder (RULE TS-D-01/03): nothing here needs to remember
// state after construction, so a function is correct — not a class.
// Stage 4 will add a separate scroll-driven path system that reads and
// writes this camera's transform; this module only ever constructs it.

import * as THREE from "three";

const DEFAULT_FOV = 60;
const DEFAULT_NEAR = 0.1;
const DEFAULT_FAR = 2000;
const DEFAULT_CAMERA_POSITION = new THREE.Vector3(0, 6, 12);

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
