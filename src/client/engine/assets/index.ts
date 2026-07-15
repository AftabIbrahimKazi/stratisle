// ASSETS — loaders and the asset registry.
//
// Owns loading of runtime assets: the South Nicobar heightmap data
// (Stage 1), textures per weather/scene state (Stage 5/6), models if
// any. Large binaries live in /public and are fetched from here —
// the engine never receives assets through React props.
//
// Will provide:
// - typed load functions with explicit error handling (RULE TS-07)
// - a registry/cache so nothing is fetched or decoded twice
// - dispose() to free GPU resources (textures/geometries) on teardown
//
// Stage 1 starts here: load heightmap → hand elevation data to the
// mesh build (materials/ + @triforge/geometry-nodes SetPosition).
