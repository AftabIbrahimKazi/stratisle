// DEBUG — dev-only tools (stats, GUI toggles, helpers).
//
// FPS/stats overlay, axis/grid helpers, temporary tweak GUIs for
// camera paths and weather states. Everything here must be:
// - gated behind a dev check so none of it ships in production builds
//   (guard with process.env.NODE_ENV !== 'production' at the call
//   site in core.ts, so the bundler can drop it entirely)
// - removable without touching other subsystems
//
// Note: no console.log in committed code (RULE TS-04) — use proper
// debug tooling here instead.
//
// Empty until the first time we need to see numbers (likely Stage 1).
