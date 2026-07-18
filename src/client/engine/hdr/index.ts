// HDR — environment/reflection maps.
//
// Stage 1: a procedural sky (Preetham atmospheric scattering model, via
// three/examples' Sky) standing in for a real HDR environment map — no
// external .hdr/.exr asset needed, and it's a full day/atmosphere model
// rather than a static image. Same "generate procedurally now, drive
// with real data later" pattern as the sea/waves — sun elevation/azimuth
// here are hardcoded placeholders; a later stage could derive them from
// real sun-position math (lat/lng + date/time, as discussed for the
// weather system) instead.
//
// Sun direction computed here is the single source of truth — lighting/
// createSunLight reads the same vector so the sky's bright spot and the
// directional light's rays always agree.
//
// Weather states (Stage 6) will likely swap or tint this (turbidity up
// for haze, rayleigh down for overcast) — design as recomputable, not
// a one-shot build.

import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";

// Comfortably bigger than the sea's own 10000-unit extent and the
// camera's far clip (9000) so the dome never clips at the horizon.
const SKY_DOME_SCALE = 20000;

// Low elevation (golden-hour/morning) — the Preetham model's overall
// sky brightness scales with sun elevation, and past ~20 degrees at
// these turbidity/rayleigh values it saturates to a washed-out white
// regardless of exposure or sun azimuth (tested both). Keeping the sun
// low is what actually reads as a sky instead of a blown-out frame.
const SUN_ELEVATION_DEGREES = 5;
const SUN_AZIMUTH_DEGREES = 180;

const TURBIDITY = 10;
const RAYLEIGH = 3;
const MIE_COEFFICIENT = 0.005;
const MIE_DIRECTIONAL_G = 0.7;

export function computeSunDirection(): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - SUN_ELEVATION_DEGREES);
  const theta = THREE.MathUtils.degToRad(SUN_AZIMUTH_DEGREES);
  return new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
}

function createSky(sunDirection: THREE.Vector3): Sky {
  const sky = new Sky();
  sky.scale.setScalar(SKY_DOME_SCALE);

  const uniforms = sky.material.uniforms;
  uniforms.sunPosition.value.copy(sunDirection);
  uniforms.turbidity.value = TURBIDITY;
  uniforms.rayleigh.value = RAYLEIGH;
  uniforms.mieCoefficient.value = MIE_COEFFICIENT;
  uniforms.mieDirectionalG.value = MIE_DIRECTIONAL_G;

  return sky;
}

// Sets up the visible sky dome and bakes it into a proper IBL
// environment map on scene.environment — the dome alone only looks
// right from inside it (the direct render), but materials that respond
// to environment lighting (once past the current placeholder materials)
// need the baked map for correct ambient/reflections.
export function setupSkyEnvironment(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  sunDirection: THREE.Vector3,
): Sky {
  const sky = createSky(sunDirection);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const bakeScene = new THREE.Scene();
  bakeScene.add(sky);
  const renderTarget = pmremGenerator.fromScene(bakeScene);
  pmremGenerator.dispose();

  scene.environment = renderTarget.texture;
  scene.add(sky); // fromScene's temp scene above steals sky's parent; move it into the real scene
  return sky;
}

// The dome is centered at the world origin, not on the camera — as the
// camera roams, its distance to the dome's far walls grows and eventually
// exceeds the camera's far clip plane, clipping the sky (same failure
// mode the sea plane hit before it got the same treatment). Standard fix:
// re-center the dome on the camera every frame, so its extent only ever
// needs to exceed the far-clip distance *relative to the camera*, not the
// absolute distance from world origin.
export function followCamera(sky: Sky, cameraPosition: THREE.Vector3): void {
  sky.position.copy(cameraPosition);
}
