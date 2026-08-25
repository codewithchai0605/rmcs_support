import type { Metadata } from "next";
import { getInitialAdStatus } from "@/lib/data";
import SupportCard from "./support-card";
import RoleCards from "./role-cards";
import Reveal from "./reveal";

export const metadata: Metadata = {
  title: "Support the game"
};

export default async function Page() {
  const status = await getInitialAdStatus();
  const zoneId = process.env.NEXT_PUBLIC_MONETAG_ZONE_ID ?? "";

  return (
    <main className="page">
      <div className="page-inner">
        <div className="hero">
          <span className="hero-eyebrow">Supporter page</span>
          <h1>
            Thank you for supporting
            <br />
            <span>Raja Mantri Chor Sipahi</span>
          </h1>
          <p className="subtitle">
            There are no ads inside the game itself. Watching one short ad
            here — about 15&ndash;30 seconds — directly funds hosting and
            future updates.
          </p>
        </div>

        <RoleCards />

        <div className="card">
          <SupportCard initialUsed={status.used} limit={status.limit} zoneId={zoneId} />
        </div>

        <Reveal>
          <div className="section">
            <span className="section-eyebrow">How it works</span>
            <h2>What happens when you tap support</h2>
            <ol className="steps-plain">
              <li>
                Tap <strong>Watch Ad &amp; Support</strong> below.
              </li>
              <li>
                A short ad opens through our ad partner, Monetag — usually
                15&ndash;30 seconds.
              </li>
              <li>
                Once it finishes, your support is counted right away. No
                purchase, no sign-in, no personal data collected.
              </li>
            </ol>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="section">
            <span className="section-eyebrow">Why we ask</span>
            <h2>Where the support goes</h2>
            <p className="section-text">
              Each ad watched pays a small amount that covers server and
              distribution costs for the game. There&rsquo;s a daily limit
              per device, shown below, so supporting never feels like a
              chore.
            </p>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
