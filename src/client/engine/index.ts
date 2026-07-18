// ENGINE ENTRY POINT — the single file React is ever allowed to import
// from the engine. Thin on purpose: constructs the engine and hands it
// back. All real engine behavior lives in core/Engine.ts and the
// subsystem folders it wires together — nothing is defined here.
//
// Rules: plain TS, no React/hooks/JSX. `import 'client-only'` fails
// the build if this file is ever imported from server code.

import "client-only";
import { Engine } from "./core/Engine";

export function createEngine(canvas: HTMLCanvasElement): Engine {
  const engine = new Engine(canvas);
  engine.setup();
  return engine;
}

export type { Engine };
