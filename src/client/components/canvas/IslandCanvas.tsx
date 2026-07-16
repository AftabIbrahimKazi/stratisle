"use client";

import { useEffect, useRef } from "react";
import { createEngine } from "@/client/engine";

// The single React/engine boundary component. Mounts the canvas, calls
// createEngine() exactly once, and destroys the engine on unmount.
// React never reaches into the engine beyond this file.
export function IslandCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = createEngine(canvas);

    return () => {
      engine.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className="sl-scene-canvas" />;
}
