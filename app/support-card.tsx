"use client";

import { useState, useTransition } from "react";
import { requestAdAttempt } from "./actions";

type MessageKind = "success" | "error" | "info";

interface Props {
  initialUsed: number;
  limit: number;
  zoneId: string;
}

declare global {
  interface Window {
    [key: `show_${string}`]: (
      options?: string | { type: string; ymid?: string; requestVar?: string }
    ) => Promise<unknown>;
  }
}

export default function SupportCard({ initialUsed, limit, zoneId }: Props) {
  const [used, setUsed] = useState(initialUsed);
  const [message, setMessage] = useState<{ text: string; kind: MessageKind } | null>(() =>
    initialUsed >= limit
      ? { text: "You've reached today's limit — thanks for the support, come back tomorrow.", kind: "info" }
      : null
  );
  const [isPending, startTransition] = useTransition();

  const limitReached = used >= limit;
  const progressPct = Math.min(100, Math.round((used / limit) * 100));

  function handleClick() {
    startTransition(async () => {
      setMessage({ text: "Loading ad…", kind: "info" });

      const result = await requestAdAttempt();
      setUsed(result.used);

      if (!result.ok) {
        setMessage({ text: "You've reached today's limit — thanks for the support, come back tomorrow.", kind: "info" });
        return;
      }

      try {
        const showAd = window[`show_${zoneId}`];
        if (typeof showAd !== "function") {
          throw new Error("Ad SDK not loaded (check NEXT_PUBLIC_MONETAG_ZONE_ID / SDK script)");
        }

        await showAd({ type: "end", ymid: result.ymid, requestVar: "support_button" });

        setMessage({ text: "Thank you for supporting Raja Mantri Chor Sipahi!", kind: "success" });
      } catch (err) {
        console.error(err);
        setMessage({ text: "The ad couldn't be shown. Please try again in a moment.", kind: "error" });
      }
    });
  }

  return (
    <>
      <button className="btn-primary" onClick={handleClick} disabled={isPending || limitReached}>
        {isPending ? (
          <>
            <span className="spinner"></span>
            Loading…
          </>
        ) : (
          "Watch Ad & Support"
        )}
      </button>

      <div className="counter-container">
        <div className="counter-row">
          <span className="counter">Today&rsquo;s support</span>
          <span className="counter">
            <strong>{used}</strong> / {limit}
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {message && <div className={`message ${message.kind}`}>{message.text}</div>}
    </>
  );
}
