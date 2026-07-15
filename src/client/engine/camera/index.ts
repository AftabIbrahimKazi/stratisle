// CAMERA — camera setup and cinematic paths.
//
// Stage 0/1: a single PerspectiveCamera with sensible defaults framing
// the island placeholder; handles aspect updates on resize (via utils/).
//
// Stage 4: the reusable scroll-driven camera-path system — each page
// defines a path (keyframed positions/targets along the island) and a
// scroll progress value (0–1) drives interpolation along it. Design the
// Stage 0 camera module so a path system can wrap it, not replace it.
//
// Rules: plain TS, no React. Scroll input arrives from controller/,
// never read directly from the DOM here.
