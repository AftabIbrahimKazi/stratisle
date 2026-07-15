// LOOP — animation/render loop.
//
// Owns requestAnimationFrame, delta-time calculation, and the per-frame
// tick that other subsystems register into. Nothing else in the engine
// calls requestAnimationFrame directly.
//
// Will provide (Stage 0/1):
// - start() / stop() — loop lifecycle, must be stoppable for dispose()
// - a tick registry: subsystems register update(delta) callbacks
// - delta time clamping (avoid huge jumps after tab-switch)
//
// Rules: plain TS, no React. Pausing when the tab is hidden is a
// Stage 9 (performance) concern — note it, don't build it yet.
