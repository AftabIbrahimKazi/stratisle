// ASSETS — loaders and the asset registry.
//
// Stage 1: loads the baked South Nicobar heightmap (see
// scripts/bake/heightmap.ts) and decodes it into a plain elevation
// grid — a single grayscale byte per sample, row-major, top row
// first (matches how canvas image data reads). materials/ turns this
// into the actual displaced geometry.

export interface ElevationField {
  readonly values: Uint8Array;
  readonly width: number;
  readonly height: number;
}

export async function loadElevationField(url: string): Promise<ElevationField> {
  const response = await fetch(url);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);

  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("2D canvas context unavailable for heightmap decode");
  }

  context.drawImage(bitmap, 0, 0);
  const imageData = context.getImageData(0, 0, bitmap.width, bitmap.height);

  return {
    values: extractGrayscaleChannel(imageData.data),
    width: bitmap.width,
    height: bitmap.height,
  };
}

// The heightmap is baked as grayscale (R === G === B), but canvas
// always decodes to interleaved RGBA — pull out just the one channel
// so downstream code indexes samples directly, no stride math.
function extractGrayscaleChannel(rgba: Uint8ClampedArray): Uint8Array {
  const sampleCount = rgba.length / 4;
  const values = new Uint8Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    values[i] = rgba[i * 4];
  }
  return values;
}
