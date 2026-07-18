// The sea — one surface, spanning the full sea extent, with real
// Gerstner wave simulation via @triforge/modifier-core's OceanModifier
// (Blender's Ocean modifier equivalent) driving both motion and
// depth-band coloring together per vertex.
//
// (Previously built as two separate meshes — a static flat depth-graded
// plane plus a small animated wave tile near the island — which was an
// artifact of how the two features got added incrementally, not an
// actual design. One mesh now; the island's footprint is cut out of it
// so the sea never renders under land, same reasoning Island.ts already
// uses for its own sea-level padding.)
//
// windSpeed/windAngle are the intended real-data hook: wave
// *generation* stays procedural (Gerstner math), but wave *behaviour*
// (amplitude, direction) is meant to be driven by a real reading (e.g.
// Open-Meteo current wind for the island's lat/lng) once the weather
// data layer exists. Hardcoded until then. Depth color is a placeholder
// for the same reason — no bathymetry data source exists yet (would
// need a GEBCO-derived raster supplied the same manual way the island's
// nicobar_heightmap.png source was), so depth is approximated as radial
// distance from the island instead of real seafloor depth.

import { OceanModifier } from "@triforge/modifier-core";
import {
  Geometry as ShaderGeometry,
  VectorMath,
  MapRange,
  ColorRamp,
  OceanAttribute,
  MixRGB,
  Emission,
  MaterialOutput,
  Fresnel,
  ShaderMath,
} from "@triforge/shader-core";
import * as THREE from "three";
import { ISLAND_WORLD_SIZE, isLandAtWorldPosition } from "./Island";
import { computeSunDirection } from "../hdr";
import type { ElevationField } from "../assets";

// Must stay much larger than ISLAND_WORLD_SIZE (5000) and any camera
// distance — this is the whole sea's footprint, not a wave-detail knob.
// (Was briefly dropped to 41 while chasing wave-scale aliasing — that
// shrank the entire sea to a speck sitting inside the island's own
// footprint, which is why it looked like the waves had vanished: most
// of it was being cut away by dropLandTriangles, not just too small to see.)
const SEA_WORLD_SIZE = 10000;
// Real-time-safe grid resolution for the full sea extent — OceanModifier
// re-evaluates every vertex against every wave component on each
// apply() call.
const SEA_RESOLUTION = 128;

// CARRIER_SCALE no longer controls visible wave size — see SWELL_SCALE
// below for that. This modifier now only supplies the mesh's topology
// (XZ grid, index) and the foam attribute; its own Y-displacement gets
// entirely replaced by the tiled swell layer in applySwellDisplacement.
// Kept at a value safe for this grid's resolution (SEA_WORLD_SIZE /
// SEA_RESOLUTION ≈ 78 spacing) purely so its foam/Jacobian computation
// stays meaningful rather than aliased — foam is still derived from
// this field, so a wildly mismatched scale here would make foam pattern
// and visible wave shape (from the swell tile) disagree more than they
// already mildly do.
const CARRIER_SCALE = 250;

// OceanModifier's default wave-component count (24) is the single
// biggest cost driver on the two high-resolution tiles (256x256 = 65536
// vertices each, evaluated against every wave component) — cutting this
// is a straight cost/quality tradeoff with no aliasing risk, unlike
// resolution or scale, both already at their safe floor for the current
// tile sizes. Halved rather than cut further since fewer components
// starts reading as visibly simpler/more repetitive wave shape.
const SWELL_WAVE_COUNT = 12;
const CHOP_WAVE_COUNT = 10;

// Rebuilding three full wave grids (carrier + swell + chop, all at real
// vertex counts) every frame is real CPU cost, not just GC churn —
// confirmed as visible jank on rebuild. 15Hz instead of the original
// 30Hz halves steady-state cost; water motion is slow enough that the
// difference isn't visually obvious.
const UPDATE_INTERVAL_SECONDS = 1 / 15;

// Placeholder wind — swap for a real Open-Meteo (or similar) reading
// once the weather data layer exists; see module comment above.
const PLACEHOLDER_WIND_SPEED = 12;
const PLACEHOLDER_WIND_ANGLE = 45;

// Distance-from-center color stops, as a fraction of REFERENCE_DISTANCE
// (0 = at the island's edge, 1 = fully "deep"). Reference distance is
// deliberately smaller than the sea's actual half-size: from the
// default eye-level camera, most of the near-shore band sits hidden
// behind/under the island itself, so the visible sea is mostly the far
// horizon strip. Compressing the full shallow->deep range into a
// shorter distance means that visible strip still shows banding instead
// of having already flattened to one late "deep" stop by the time it
// comes into view.
//
// ColorRamp (shader-core) only supports evenly-spaced stops, unlike the
// hand-rolled version this replaced (which had custom positions per
// stop) — listed in visual order shallow->deep, spacing is now uniform
// rather than front-loaded near shore. Close enough for a placeholder
// gradient; not worth a custom GLSL ramp function over this.
const REFERENCE_DISTANCE = 3200;
const DEPTH_COLOR_STOPS = [
  "#bdeee6", // shallow, near shore
  "#6ec6d9",
  "#3f9cc2",
  "#226f9e",
  "#144d78",
  "#0a2547", // deep, open ocean
];

// Swell layer — the actual visible wave-shape source. Same tiling
// technique as the chop layer below (a smaller, higher-detail
// OceanModifier tile, wrapped via world-position modulo), but this one
// *replaces* the carrier's Y entirely rather than adding to it — the
// carrier's own CARRIER_SCALE=250 field was the "looks like a tsunami"
// problem (wavelength far too large relative to the 5000-unit island),
// and it's a single 10000-unit grid at SEA_RESOLUTION's 78-unit spacing,
// so it physically cannot resolve anything smaller than ~150-200 without
// aliasing (see CARRIER_SCALE's old floor). Tiling a smaller patch is
// the only way to get proportionate swell size cleanly.
//
// Tile size is deliberately much larger than the chop tile — large
// rolling wave shapes repeating is far more perceptually obvious than
// fine ripple texture repeating, so this needs a bigger tile (fewer
// repeats across the visible sea) even though that means a less
// aggressive resolution/scale ratio than the chop layer gets away with.
const SWELL_TILE_SIZE = 2000;
const SWELL_RESOLUTION = 256;
const SWELL_SCALE = 30;

// Fine chop layer — a second, much smaller OceanModifier tile whose
// height is added on top of the swell layer's own displacement,
// repeated (wrapped) across the sea via world-position modulo. Gets
// waves reading roughly 10x smaller without needing SEA_RESOLUTION
// higher than OceanModifier's internal 256 cap allows on the full
// 10000-unit sea (see CARRIER_SCALE's comment for why that's a hard wall).
//
// (First attempt at fine detail perturbed only the shading *normal* via
// AnimatedNoiseTexture + Bump — abandoned: Bump's derivative method
// (dFdx/dFdy) is unstable at this world scale, producing screen-space
// static no amount of strength/scale tuning fixed. This approach avoids
// that class of bug entirely — it's real per-vertex displacement, and
// normals come from geometry.computeVertexNormals() afterward, which is
// a stable face-geometry calculation, not a screen-space derivative.)
//
// Repetition risk: this tile *does* repeat exactly every CHOP_TILE_SIZE
// units — but as fine detail sitting on top of the large, non-repeating
// swell shape (which dominates what's actually visible), the repeat is
// far less noticeable than tiling the whole wave pattern would be. Not
// literally repeat-proof; a real fix would need domain-warped tiling,
// out of scope here.
//
// Unlike SEA_WORLD_SIZE, this tile isn't constrained to stay bigger
// than the island — it only needs to repeat cleanly. So getting the
// chop smaller means shrinking the tile itself to keep spacing tight,
// since CHOP_RESOLUTION is already at OceanModifier's 256 cap: 40/256
// ≈ 0.156 unit spacing keeps the same ~3x safety margin under
// CHOP_SCALE that worked at the larger sizes. Tradeoff: tighter tile =
// more repeats per unit distance, i.e. higher-frequency repetition —
// still fine detail, so still much less noticeable than wave-scale-
// level repetition would be, but this is getting close to the point
// where that stops being true (40-unit tiles start being individually
// perceptible up close, not just texture).
const CHOP_TILE_SIZE = 40;
const CHOP_RESOLUTION = 256;
const CHOP_SCALE = 0.5;

// Higher = tighter, more mirror-like sparkle; lower = broader, softer
// glint. 128 is a fairly tight highlight, appropriate for calm-ish water.
const SPECULAR_SHININESS = 128;
// Tint for the Fresnel rim at grazing angles — a pale sky-blue standing
// in for "reflecting the sky" until this actually samples hdr/'s sky
// environment map instead of a flat color.
const SKY_REFLECTION_TINT = "#dceeff";

// The sea must never render under the island. Before the real elevation
// data has loaded, fall back to the conservative island bounding-square
// cutout (guaranteed to cover all actual land, just wastefully — it also
// removes the flat ocean padding *inside* the heightmap's own bounding
// box, which otherwise renders as neither island nor sea: a black gap
// between the real coastline and the square's edge). Once elevation data
// is available, sample the actual heightmap instead so the cutout
// follows the real coastline.
function dropLandTriangles(
  geometry: THREE.BufferGeometry,
  elevation: ElevationField | null,
): void {
  const index = geometry.getIndex();
  const position = geometry.getAttribute("position");
  if (!index) return;

  const half = ISLAND_WORLD_SIZE / 2;
  const isLand = (i: number): boolean => {
    const x = position.getX(i);
    const z = position.getZ(i);
    if (Math.abs(x) > half || Math.abs(z) > half) return false;
    return elevation ? isLandAtWorldPosition(elevation, x, z) : true;
  };

  const keptIndices: number[] = [];
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i);
    const b = index.getX(i + 1);
    const c = index.getX(i + 2);
    if (!(isLand(a) && isLand(b) && isLand(c))) {
      keptIndices.push(a, b, c);
    }
  }

  geometry.setIndex(keptIndices);
}

// Shared by the swell and chop tiling below: wraps a world (x, z) into
// a tile's local index-grid coordinates via modulo, so a small
// OceanModifier tile's own baked position buffer can be sampled at any
// point on the (much larger) main sea grid. Nearest-neighbor — both
// layers are detail/shape sources, not worth bilinear interpolation
// cost for a difference no one will see.
function sampleTiledY(
  x: number,
  z: number,
  tileSize: number,
  tileResolution: number,
  tilePosition: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
): number {
  const half = tileSize / 2;
  // Shift/mod/shift-back so negative coordinates wrap correctly too.
  const localX = (((x + half) % tileSize) + tileSize) % tileSize - half;
  const localZ = (((z + half) % tileSize) + tileSize) % tileSize - half;
  const u = (localX + half) / tileSize;
  const v = (localZ + half) / tileSize;
  const col = Math.min(tileResolution - 1, Math.max(0, Math.round(u * (tileResolution - 1))));
  const row = Math.min(tileResolution - 1, Math.max(0, Math.round(v * (tileResolution - 1))));
  return tilePosition.getY(row * tileResolution + col);
}

// Replaces the carrier geometry's own (aliasing-floor-limited) Y
// entirely with the tiled swell layer's — this is the actual visible
// wave shape now, not an additive detail. See SWELL_* comments above.
function applySwellDisplacement(geometry: THREE.BufferGeometry, swellModifier: OceanModifier): void {
  const swellGeometry = swellModifier.apply(new THREE.BufferGeometry());
  const swellPosition = swellGeometry.getAttribute("position");
  const position = geometry.getAttribute("position");

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    position.setY(i, sampleTiledY(x, z, SWELL_TILE_SIZE, SWELL_RESOLUTION, swellPosition));
  }

  position.needsUpdate = true;
}

// Adds the chop layer's Y-displacement on top of the swell layer's own
// (seamlessly tiling — OceanModifier quantizes its wave vectors
// specifically so the pattern repeats exactly at the tile boundary), so
// it wraps across the full sea without visible seams.
function applyChopDetail(geometry: THREE.BufferGeometry, chopModifier: OceanModifier): void {
  const chopGeometry = chopModifier.apply(new THREE.BufferGeometry());
  const chopPosition = chopGeometry.getAttribute("position");
  const position = geometry.getAttribute("position");

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    const chopY = sampleTiledY(x, z, CHOP_TILE_SIZE, CHOP_RESOLUTION, chopPosition);
    position.setY(i, position.getY(i) + chopY);
  }

  position.needsUpdate = true;
}

// Depth-band base color (placeholder, see module comment) blended
// toward white by the modifier's real foam output — crest/breaking
// detection from the wave Jacobian, not decorative. Built as a
// @triforge/shader-core node graph instead of a hand-rolled per-vertex
// CPU color loop: OceanAttribute reads the same `foam` buffer the old
// code pulled manually, ColorRamp replaces distanceToDepthColor's
// lerp-between-stops logic. Compiled once — the resulting ShaderMaterial
// is reused across every geometry rebuild (waves, land-mask refinement),
// so per-frame cost drops to whatever the GPU does per fragment, not a
// CPU loop over every vertex.
function buildSeaMaterial(): THREE.ShaderMaterial {
  const geometry = new ShaderGeometry();
  const distance = new VectorMath({ mode: "LENGTH", vector: geometry.output("Position") });
  const depthFactor = new MapRange({
    value: distance.output("Value"),
    fromMin: 0,
    fromMax: REFERENCE_DISTANCE,
    toMin: 0,
    toMax: 1,
    clamp: true,
  });
  const depthColor = new ColorRamp({ fac: depthFactor.output("Result"), stops: DEPTH_COLOR_STOPS });

  const foam = new OceanAttribute();
  const withFoam = new MixRGB({
    mode: "MIX",
    fac: foam.output("Fac"),
    colorA: depthColor.output("Color"),
    colorB: "#ffffff",
  });

  // Depth+foam alone reads as a flat painted surface — water's actual
  // visual signature is view-dependent light response, which a purely
  // unlit color has none of. Two cheap additions to fake that without a
  // real lighting pass:
  //
  // 1. A sun specular highlight (Blinn-Phong half-vector) — a moving
  //    glint on the wave crests facing the sun, using the same sun
  //    direction hdr/ computes (single source of truth, see that
  //    module). This is the single biggest "does it look real" cue for
  //    water — without it the surface has zero relationship to the sky.
  const sunDirection = computeSunDirection();
  const viewDirection = new VectorMath({ mode: "SCALE", vector: geometry.output("Incoming"), scale: -1 });
  const halfwayRaw = new VectorMath({
    mode: "ADD",
    vector: viewDirection.output("Vector"),
    vectorB: [sunDirection.x, sunDirection.y, sunDirection.z],
  });
  const halfwayVector = new VectorMath({ mode: "NORMALIZE", vector: halfwayRaw.output("Vector") });
  const normalDotHalfway = new VectorMath({
    mode: "DOT_PRODUCT",
    vector: geometry.output("Normal"),
    vectorB: halfwayVector.output("Vector"),
  });
  const facingSun = new ShaderMath({ mode: "MAXIMUM", a: normalDotHalfway.output("Value"), b: 0 });
  const specularIntensity = new ShaderMath({ mode: "POWER", a: facingSun.output("Value"), b: SPECULAR_SHININESS });
  const withSpecular = new MixRGB({
    mode: "ADD",
    fac: specularIntensity.output("Value"),
    colorA: withFoam.output("Color"),
    colorB: "#ffffff",
  });

  // 2. Fresnel rim brightening — grazing-angle views (near the horizon)
  //    read as reflecting the sky, straight-down views read as seeing
  //    into the water. Real water is far more reflective at grazing
  //    angles than head-on; flat unlit color has no such falloff at all.
  const fresnel = new Fresnel({ normal: geometry.output("Normal") });
  const withFresnel = new MixRGB({
    mode: "MIX",
    fac: fresnel.output("Fac"),
    colorA: withSpecular.output("Color"),
    colorB: SKY_REFLECTION_TINT,
  });

  // Emission (unlit, self-illuminating) matches the previous
  // MeshBasicMaterial's behaviour — the scene's lights (lighting/) don't
  // actually light this surface; the specular/fresnel above are a
  // hand-built approximation of light response, not real illumination.
  const surface = new Emission({ color: withFresnel.output("Color"), strength: 1.0 });
  const output = new MaterialOutput({ surface: surface.output("BSDF") });
  return output.compile();
}

export class Sea {
  public readonly mesh: THREE.Mesh;
  private readonly _carrierModifier: OceanModifier;
  private readonly _swellModifier: OceanModifier;
  private readonly _chopModifier: OceanModifier;
  private _elapsedTime = 0;
  private _timeSinceLastRebuild = 0;
  private _elevation: ElevationField | null = null;

  constructor() {
    this._carrierModifier = new OceanModifier({
      size: SEA_WORLD_SIZE,
      resolution: SEA_RESOLUTION,
      scale: CARRIER_SCALE,
      windSpeed: PLACEHOLDER_WIND_SPEED,
      windAngle: PLACEHOLDER_WIND_ANGLE,
    });
    this._swellModifier = new OceanModifier({
      size: SWELL_TILE_SIZE,
      resolution: SWELL_RESOLUTION,
      scale: SWELL_SCALE,
      waveCount: SWELL_WAVE_COUNT,
      windSpeed: PLACEHOLDER_WIND_SPEED,
      windAngle: PLACEHOLDER_WIND_ANGLE,
    });
    this._chopModifier = new OceanModifier({
      size: CHOP_TILE_SIZE,
      resolution: CHOP_RESOLUTION,
      scale: CHOP_SCALE,
      waveCount: CHOP_WAVE_COUNT,
      windSpeed: PLACEHOLDER_WIND_SPEED,
      windAngle: PLACEHOLDER_WIND_ANGLE,
    });

    // OceanModifier's grid is already Y-up (height on Y, footprint in
    // XZ) — unlike geometry-nodes' Grid, no rotation is needed here.
    //
    // Built carrier-only (no swell/chop) for the very first frame — the
    // full three-tile build is ~147k vertex evaluations across three
    // OceanModifier.apply() calls, done synchronously in the constructor
    // this would otherwise block the initial paint on (the actual source
    // of the reported load jank, not steady-state per-frame cost). The
    // full detail swaps in one frame later via requestAnimationFrame,
    // imperceptible after first paint but avoids stalling it.
    this.mesh = new THREE.Mesh(this._buildGeometry({ includeDetail: false }), buildSeaMaterial());
    requestAnimationFrame(() => {
      const nextGeometry = this._buildGeometry({ includeDetail: true });
      this.mesh.geometry.dispose();
      this.mesh.geometry = nextGeometry;
    });
  }

  // Called once the island's real elevation data has loaded — refines
  // the sea's cutout from the conservative bounding-square approximation
  // to the actual coastline, and rebuilds immediately rather than
  // waiting for the next throttled tick.
  public setLandMask(elevation: ElevationField): void {
    this._elevation = elevation;
    const nextGeometry = this._buildGeometry({ includeDetail: true });
    this.mesh.geometry.dispose();
    this.mesh.geometry = nextGeometry;
  }

  public update(delta: number): void {
    this._elapsedTime += delta;
    this._timeSinceLastRebuild += delta;
    if (this._timeSinceLastRebuild < UPDATE_INTERVAL_SECONDS) return;
    this._timeSinceLastRebuild = 0;

    this._carrierModifier.parameters.time = this._elapsedTime;
    this._swellModifier.parameters.time = this._elapsedTime;
    this._chopModifier.parameters.time = this._elapsedTime;
    const nextGeometry = this._buildGeometry({ includeDetail: true });
    this.mesh.geometry.dispose();
    this.mesh.geometry = nextGeometry;
  }

  public dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }

  // includeDetail: false skips the swell/chop tiling passes — used only
  // for the very first synchronous build (see constructor) to keep that
  // one cheap. Every subsequent build includes full detail.
  private _buildGeometry({ includeDetail }: { includeDetail: boolean }): THREE.BufferGeometry {
    // OceanModifier ignores its input geometry and always generates its
    // own grid — an empty placeholder satisfies the interface contract.
    // Carrier supplies topology (XZ, index) + foam; with detail included,
    // its own Y gets replaced/added-to by the tiled swell/chop layers.
    const geometry = this._carrierModifier.apply(new THREE.BufferGeometry());
    if (includeDetail) {
      applySwellDisplacement(geometry, this._swellModifier);
      applyChopDetail(geometry, this._chopModifier);
    }
    dropLandTriangles(geometry, this._elevation);
    // Positions may have been rewritten by the swell/chop layers after
    // the carrier's own analytic Gerstner normals were computed —
    // recompute from the final triangle geometry so specular/Fresnel
    // react to the actual visible shape. Stable face-geometry
    // calculation, not a screen-space derivative, so it doesn't carry
    // the instability the earlier Bump-based attempt hit.
    geometry.computeVertexNormals();
    return geometry;
  }
}
