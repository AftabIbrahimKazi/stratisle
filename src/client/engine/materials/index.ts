// MATERIALS — materials and shaders (Triforge node graphs live here).
//
// Barrel for the scene's material/geometry builders — one file per
// material, same pattern as engine/debug/. Add new materials as their
// own named file here as the scene grows (Stage 5/6: per-weather
// texture variants), not piled into this index.
//
// Rules: plain TS, no React. Shader edge cases → consult the
// threejs-scene / triforge skills before debugging blind.

export { buildIslandGeometry, createIslandMesh, loadIslandMesh } from "./Island";
export { buildSeaPlaneMesh } from "./SeaPlane";
