// LIGHTING — explicit lights (sun, ambient, fill).
//
// Separate from hdr/ by project convention: this folder owns actual
// light objects and their animation (sun angle, intensity), hdr/ owns
// image-based environment maps. Weather states (Stage 6) will drive
// both — e.g. 'rain' dims the sun and cools the ambient color.
//
// Design note: expose setLightingState(state) so weather transitions
// can tween lighting rather than hard-swap it.
//
// Empty until the first lit scene (Stage 1/2).
