// CONTROLLER — input/interaction handling.
//
// Central place for DOM input listeners: scroll position (feeds the
// Stage 4 camera paths) and swipe gestures (feeds the Stage 5 scene
// transitions). Translates raw DOM events into normalized engine
// signals (e.g. scrollProgress: 0–1, swipe: 'left' | 'right').
//
// Rules:
// - Every addEventListener has a matching removal path exposed via a
//   dispose()/unbind() (RULE TS-05) — wired into core.ts dispose().
// - Emits into state/ or calls orchestrator callbacks; never reaches
//   into other subsystems directly.
//
// Empty until Stage 4/5.
