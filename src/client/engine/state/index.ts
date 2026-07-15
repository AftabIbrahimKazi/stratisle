// STATE — the engine's scene-state store (plain TS, NOT React state).
//
// Single designated module for shared engine state (RULE TS-06):
// current weather state, active scene/page, transition progress, etc.
// Subsystems read from here instead of holding their own copies.
//
// Rules / design notes:
// - This store belongs to the engine world. React has its own state;
//   the two only meet through core.ts calls (React → engine) and
//   optional subscribe callbacks (engine → React, e.g. loading done).
// - Per-frame values (delta, elapsed) do NOT live here — they flow
//   through loop/ tick parameters. This store is for discrete state.
// - Keep it dumb: typed values + a small subscribe/notify mechanism.
//
// First real use: Stage 5/6 (scene + weather states).
