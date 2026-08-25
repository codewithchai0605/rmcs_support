import type { Metadata } from "next";
import Link from "next/link";
import { getLatestAppVersion } from "@/lib/data";
import { formatBytes } from "@/lib/format";
import RoleCards from "../role-cards";
import Reveal from "../reveal";
import styles from "./download.module.css";

// This page's whole job is to always show the release the CLI most recently
// published. There's no build-time content here to cache, so force it to
// run per-request rather than being frozen into the static build output.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Download",
  description: "Download the latest Raja Mantri Chor Sipahi Android app directly — no Play Store account needed."
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(date));
}

export default async function DownloadPage() {
  const release = await getLatestAppVersion();

  return (
    <main className="page">
      <div className="page-inner wide">
        <div className="hero">
          <span className="hero-eyebrow">Official download</span>
          <h1>
            Get <span>Raja Mantri Chor Sipahi</span>
            <br />
            on your phone
          </h1>
          <p className="subtitle">
            The classic King, Minister, Thief, Soldier party game, free to
            play — published directly by its developer, no Play Store
            account needed.
          </p>
        </div>

        <RoleCards />

        {release ? (
          <>
            <div className="card">
              <a href={release.apkUrl} className={styles.downloadBtn} download>
                <span className={styles.downloadIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4v12" />
                    <path d="M6.5 11.5 12 17l5.5-5.5" />
                    <path d="M5 20h14" />
                  </svg>
                </span>
                <span className={styles.downloadText}>
                  <strong>Download APK</strong>
                  <span>
                    v{release.version} &middot; build {release.buildNumber}
                  </span>
                </span>
              </a>

              <div className={styles.metaGrid}>
                <div className={styles.metaChip}>
                  <span className={styles.metaLabel}>Version</span>
                  <span className={styles.metaValue}>{release.version}</span>
                </div>
                <div className={styles.metaChip}>
                  <span className={styles.metaLabel}>Build</span>
                  <span className={styles.metaValue}>{release.buildNumber}</span>
                </div>
                <div className={styles.metaChip}>
                  <span className={styles.metaLabel}>Size</span>
                  <span className={styles.metaValue}>
                    {formatBytes(release.fileSizeBytes)}
                  </span>
                </div>
                <div className={styles.metaChip}>
                  <span className={styles.metaLabel}>Updated</span>
                  <span className={styles.metaValue}>
                    {formatDate(release.updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            <Reveal>
              <div className="section">
                <span className="section-eyebrow">About the game</span>
                <h2>Four roles, one round, endless bragging rights</h2>
                <p className="section-text">
                  Raja Mantri Chor Sipahi is a classic pen-and-paper party
                  game turned into a quick digital round. Each round, the
                  four roles are dealt out at random. The King and Minister
                  reveal themselves early; the Soldier&rsquo;s job is to
                  correctly point out the Thief hiding among the rest.
                  Guess right, and the Soldier scores big — guess wrong, and
                  the Thief gets away with it.
                </p>
              </div>
            </Reveal>

            {release.releaseNotes && (
              <Reveal delay={60}>
                <div className="section">
                  <span className="section-eyebrow">Latest release</span>
                  <h2>What&rsquo;s new</h2>
                  <p className={`section-text ${styles.preLine}`}>{release.releaseNotes}</p>
                </div>
              </Reveal>
            )}

            <Reveal delay={90}>
              <div className="section">
                <span className="section-eyebrow">Setup</span>
                <h2>How to install</h2>
                <ol className="steps-plain">
                  <li>
                    Tap <strong>Download APK</strong> above.
                  </li>
                  <li>
                    If your phone warns about &ldquo;unknown sources,&rdquo;
                    allow installs from your browser — that&rsquo;s normal
                    for apps installed outside the Play Store.
                  </li>
                  <li>
                    Open the downloaded file and tap <strong>Install</strong>.
                  </li>
                  <li>Launch the app and enjoy.</li>
                </ol>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="section">
                <span className="section-eyebrow">Good to know</span>
                <h2>Frequently asked</h2>
                <div className={styles.faqList}>
                  <div className={styles.faqItem}>
                    <p className={styles.faqQ}>Is it safe to install an APK directly?</p>
                    <p className="section-text">
                      Android shows an &ldquo;install from unknown
                      sources&rdquo; warning for anything that comes from
                      outside the Play Store — that&rsquo;s expected for a
                      direct download like this one, not a sign something is
                      wrong. You only need to approve it once for your
                      browser.
                    </p>
                  </div>
                  <div className={styles.faqItem}>
                    <p className={styles.faqQ}>Do I need a Google account or the Play Store?</p>
                    <p className="section-text">
                      No. The APK installs and runs on its own — no Play
                      Store account required.
                    </p>
                  </div>
                  <div className={styles.faqItem}>
                    <p className={styles.faqQ}>Something not working?</p>
                    <p className="section-text">
                      Reach out any time using the contact link in the
                      footer below.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <p className={styles.thankYou}>
              Thank you for downloading Raja Mantri Chor Sipahi. We hope you
              have a blast playing. If you&rsquo;d like to help keep it free
              for everyone, you can also{" "}
              <Link href="/">support us by watching a quick ad</Link>.
            </p>
          </>
        ) : (
          <div className="message info">
            No release has been published yet — check back soon.
          </div>
        )}
      </div>
    </main>
  );
}
