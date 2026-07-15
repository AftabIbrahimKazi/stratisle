// UTILS — small shared helpers for the engine.
//
// Expected early residents:
// - resize handling: observe canvas size, update renderer + camera
//   aspect (listener cleanup per RULE TS-05)
// - math helpers: lerp, clamp, remap (scroll 0–1 → path position)
// - DPR capping helper (max devicePixelRatio — a Stage 9 knob, but
//   the renderer setup will want it from day one)
//
// Rules: pure functions where possible, no imports from other engine
// subsystems (utils sit at the bottom of the dependency graph).
