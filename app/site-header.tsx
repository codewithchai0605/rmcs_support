"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Support" },
  { href: "/download", label: "Download" }
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="wordmark">
          <span className="wordmark-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 18h16" />
              <path d="M5 18l-1-8 4 3 4-6 4 6 4-3-1 8" />
            </svg>
          </span>
          <span className="wordmark-text">
            <span className="wordmark-title">Raja Mantri Chor Sipahi</span>
            <span className="wordmark-sub">Official app</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} data-active={pathname === link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
