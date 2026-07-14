import Image from "next/image";

export default function Home() {
  return (
    <main className="container d-flex flex-column align-items-center justify-content-center gap-4 py-5 mt-5">
      <Image src="/next.svg" alt="Next.js logo" width={100} height={20} priority />

      <div className="card max-w-[560px] w-100">
        <div className="card-header d-flex align-items-center justify-content-between">
          <span className="fw-bold">Stratisle</span>
          <span className="badge-info">Strata CSS</span>
        </div>
        <div className="card-body">
          <h1 className="mb-2">To get started, edit the page.tsx file.</h1>
          <p className="text-secondary mb-0">
            This page is styled entirely with Strata component classes and
            utilities — no CSS modules, no custom styles.
          </p>
        </div>
        <div className="card-footer d-flex gap-2 justify-content-end">
          <a
            className="btn-primary"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js Docs
          </a>
          <a
            className="btn-outline-secondary"
            href="https://aftabibrahimkazi.github.io/strata"
            target="_blank"
            rel="noopener noreferrer"
          >
            Strata Demo
          </a>
        </div>
      </div>
    </main>
  );
}
