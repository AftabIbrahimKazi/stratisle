// ENGINE ORCHESTRATOR — the single entry point to the 3D engine.
//
// This is the ONLY file React is ever allowed to import from the engine.
// It wires every subsystem together (loop, camera, assets, materials,
// lighting, state, …) and exposes a small imperative API, e.g.:
//
//   const engine = createEngine(canvas);   // called ONCE on mount
//   engine.setWeather('rain');             // React forwards user events
//   engine.dispose();                      // called on unmount
//
// Rules:
// - Plain TypeScript only. No React imports, no hooks, no JSX — ever.
//   React must never drive the animation loop or hold per-frame state.
// - Client-only code. Once the `client-only` package is installed,
//   `import 'client-only';` becomes the first line of this file so any
//   accidental server-side import fails the build.
// - Subsystems talk to each other through this orchestrator (or the
//   state/ store), never by importing each other ad hoc.
//
// First real implementation (Stage 0 close): createEngine() rendering a
// spinning placeholder plane via loop/ + camera/ to prove the pipeline.
