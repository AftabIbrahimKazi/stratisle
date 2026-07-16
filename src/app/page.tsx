export default function Home() {
  return (
    <main className="container d-flex flex-column align-items-center justify-content-center gap-4 py-5 mt-5">
      <div className="text-center">
        <span className="badge-info mb-3">In development · Stage 1 of 10</span>
        <h1 className="mb-2">Stratisle</h1>
        <p className="text-secondary max-w-[640px]">
          A cinematic 3D experience of South Nicobar Island — real heightmap
          terrain, scroll-driven camera paths, and live weather rendered on a
          single persistent island mesh.
        </p>
      </div>

      <div className="d-flex gap-3 flex-wrap justify-content-center w-100">
        <div className="card max-w-[300px] w-100">
          <div className="card-header fw-bold">Terrain</div>
          <div className="card-body">
            <p className="text-secondary mb-0">
              Real elevation data of South Nicobar Island converted into a
              detailed 3D mesh with Triforge geometry nodes.
            </p>
          </div>
        </div>
        <div className="card max-w-[300px] w-100">
          <div className="card-header fw-bold">Weather</div>
          <div className="card-body">
            <p className="text-secondary mb-0">
              Live weather data drives the look of every scene — clear, rain,
              and cloud states mirroring real island conditions.
            </p>
          </div>
        </div>
        <div className="card max-w-[300px] w-100">
          <div className="card-header fw-bold">Cinematics</div>
          <div className="card-body">
            <p className="text-secondary mb-0">
              Five pages, each a vertical scroll-driven camera journey around a
              different part of the island — no reloads, one seamless flow.
            </p>
          </div>
        </div>
      </div>

    </main>
  );
}
