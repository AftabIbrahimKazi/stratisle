// UTILS — small shared helpers for the engine. Pure functions only
// (RULE TS-U-01/02/03): no imports from class or controller files,
// utils sit at the bottom of the dependency graph.

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
