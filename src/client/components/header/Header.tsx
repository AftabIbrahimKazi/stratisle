import Link from "next/link";

// Site header — Strata navbar component classes only (CSS RULE 18).
// Server Component: no interactivity yet, so no 'use client'. The Strata
// off-canvas menu arrives later and will make this (or a child) a client
// component then.
export function Header() {
  return (
    <header className="sl-header">
      <nav className="navbar navbar-expand container">
        <Link href="/" className="navbar-brand">
          Stratisle
        </Link>
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link href="/" className="nav-link">
              Home
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
