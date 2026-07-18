// LIGHTING — explicit lights (sun, ambient, fill).
//
// Separate from hdr/ by project convention: this folder owns actual
// light objects and their animation (sun angle, intensity), hdr/ owns
// image-based environment maps. Weather states (Stage 6) will drive
// both — e.g. 'rain' dims the sun and cools the ambient color.
//
// Sun direction is passed in rather than computed here — hdr/'s
// procedural sky is the single source of truth for where the sun sits,
// so the sky's bright spot and this light's rays always agree.
//
// Note: the scene's current materials (MeshBasicMaterial on the sea,
// MeshNormalMaterial on the island — both still Stage 1 placeholders)
// don't respond to lights or scene.environment at all. This light is
// real infrastructure with no visible effect yet, not decoration — it
// starts mattering once materials move off placeholders.

import * as THREE from "three";

const SUN_DISTANCE = 5000; // light is directional (parallel rays); distance only affects shadow-camera framing, added later
const SUN_COLOR = 0xfff4e6;
const SUN_INTENSITY = 3;

const AMBIENT_SKY_COLOR = 0x8ecae6;
const AMBIENT_GROUND_COLOR = 0x2b2015;
const AMBIENT_INTENSITY = 0.6;

export function createSunLight(sunDirection: THREE.Vector3): THREE.DirectionalLight {
  const light = new THREE.DirectionalLight(SUN_COLOR, SUN_INTENSITY);
  light.position.copy(sunDirection).multiplyScalar(SUN_DISTANCE);
  return light;
}

// Cheap stand-in for sky-bounce ambient light — soft sky-tinted light
// from above, ground-tinted from below, so unlit-side surfaces aren't
// pure black once materials respond to lighting.
export function createAmbientFill(): THREE.HemisphereLight {
  return new THREE.HemisphereLight(AMBIENT_SKY_COLOR, AMBIENT_GROUND_COLOR, AMBIENT_INTENSITY);
}
