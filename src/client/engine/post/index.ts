// POST — post-processing (deferred).
//
// Effect composer / render passes for the cinematic look: bloom, color
// grading, vignette, possibly weather-tied effects (rain distortion).
//
// Deliberately empty for now — post-processing is a cost multiplier on
// weak devices, so it arrives late (after Stage 6, tuned in Stage 9)
// and every pass must justify its frame budget. When added, the loop/
// render call switches from renderer.render() to composer.render()
// via core.ts, not by post/ hooking itself in.
