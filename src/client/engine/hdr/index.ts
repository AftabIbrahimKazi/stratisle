// HDR — environment/reflection maps.
//
// Loads and manages HDR environment maps (sky, ambient reflections).
// Separate from lighting/ by project convention: HDR = image-based
// environment, lighting/ = explicit lights (sun, ambient).
//
// Notes for later:
// - .hdr/.exr files are heavy — they live in /public, and compressed
//   alternatives are a Stage 9 concern.
// - Weather states (Stage 6) will likely swap or tint the environment
//   map — design the API as setEnvironment(state), not a one-shot load.
//
// Empty until first environment work (Stage 1/2 polish or Stage 6).
