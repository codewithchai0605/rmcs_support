import { getInitialAdStatus } from "@/lib/data";
import SupportCard from "./support-card";

export default async function Page() {
  const status = await getInitialAdStatus();
  const zoneId = process.env.NEXT_PUBLIC_MONETAG_ZONE_ID ?? "";

  return (
    <main className="page">
      <div className="card">
        <div className="emoji-container">
          <div className="emoji">👑</div>
          <div className="emoji">🃏</div>
          <div className="emoji">🕵️</div>
          <div className="emoji">💂</div>
        </div>
        <div className="header-text">
          <h1>
            Thank you for supporting
            <br />
            <span>Raja Mantri Chor Sipahi</span>!
          </h1>
          <p className="subtitle">
            Every ad you watch helps keep the game free and growing. It only
            takes a few seconds — thank you for the support! 🙏
          </p>
        </div>

        <SupportCard initialUsed={status.used} limit={status.limit} zoneId={zoneId} />
      </div>
    </main>
  );
}