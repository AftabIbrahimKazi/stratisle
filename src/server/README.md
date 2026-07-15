# src/server — server-only logic

All server-side data work lives here. `app/api/` route files stay thin:
they handle the HTTP part and call functions from this folder.

Boundary rule: once the `server-only` package is installed
(`npm i server-only`), EVERY file in this folder starts with
`import 'server-only';` — so accidentally importing server code into a
client component fails the build instead of leaking to the browser.

Planned residents (nothing here runs before Stage 3):

- `heightmap/` — fetch the South Nicobar heightmap from the source
  (same as the Kisoma project — confirm with dev) and parse it into a
  typed elevation grid the client engine consumes. Heavy one-time
  outputs may instead be baked at build time via `scripts/bake/`.
- `weather/` — fetch live weather (Open-Meteo suggested, no API key),
  normalize it to the engine's weather states, cache via ISR-style
  revalidation to respect free-API rate limits.

Remember: this folder prepares DATA (CPU work). It never renders
anything — all GPU/rendering is client-side in `src/client/engine/`.
