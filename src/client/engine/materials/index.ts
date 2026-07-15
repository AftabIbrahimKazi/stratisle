// MATERIALS — materials and shaders (Triforge node graphs live here).
//
// Owns every material in the scene, built with @triforge packages
// (e.g. geometry-nodes SetPosition for the Stage 1 heightmap
// displacement) and/or raw three.js materials.
//
// Will provide:
// - the island terrain material + displacement graph (Stage 1)
// - per-weather/scene texture variants (Stage 5/6) — the core island
//   mesh never changes, only its textures/materials do
// - dispose() for all materials/textures created here
//
// Rules: plain TS, no React. Shader edge cases → consult the
// threejs-scene / triforge skills before debugging blind.
