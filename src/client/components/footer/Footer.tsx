// Site footer — Strata utility classes only (CSS RULE 18).
// Server Component: static content, no 'use client' needed.
export function Footer() {
  return (
    <footer className="container d-flex flex-wrap align-items-center justify-content-between gap-2 py-4 mt-5">
      <p className="text-secondary mb-0">
        Stratisle — a South Nicobar Island 3D experience
      </p>
      <p className="text-secondary mb-0">
        Built with{" "}
        <a
          href="https://aftabibrahimkazi.github.io/strata"
          target="_blank"
          rel="noopener noreferrer"
        >
          Strata CSS
        </a>{" "}
        and{" "}
        <a
          href="https://github.com/AftabIbrahimKazi/triforge"
          target="_blank"
          rel="noopener noreferrer"
        >
          Triforge
        </a>
      </p>
    </footer>
  );
}
