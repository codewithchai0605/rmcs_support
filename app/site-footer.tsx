import Link from "next/link";

// NOTE: placeholder contact address — swap for a real, monitored support
// inbox before shipping.
const SUPPORT_EMAIL = "support@rajamantrichorsipahi.app";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-row">
          <span className="wordmark-title" style={{ fontSize: 14 }}>
            Raja Mantri Chor Sipahi
          </span>
          <div className="site-footer-links">
            <Link href="/">Support the game</Link>
            <Link href="/download">Download</Link>
            {/* <a href={`mailto:${SUPPORT_EMAIL}`}>Contact support</a> */}
          </div>
        </div>
        <p className="site-footer-meta">
          No account needed to play. We store a daily ad-watch count tied to a
          device cookie so the support limit resets each day — nothing more.
          &copy; {year} Raja Mantri Chor Sipahi.
        </p>
      </div>
    </footer>
  );
}
