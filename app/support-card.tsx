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
      ? { text: "You've hit today's limit — come back tomorrow! 🎉", kind: "info" }
      : null
  );
  const [isPending, startTransition] = useTransition();

  const limitReached = used >= limit;

  function handleClick() {
    startTransition(async () => {
      setMessage({ text: "Loading ad…", kind: "info" });

      const result = await requestAdAttempt();
      setUsed(result.used);

      if (!result.ok) {
        setMessage({ text: "You've hit today's limit — come back tomorrow! 🎉", kind: "info" });
        return;
      }

      try {
        const showAd = window[`show_${zoneId}`];
        if (typeof showAd !== "function") {
          throw new Error("Ad SDK not loaded (check NEXT_PUBLIC_MONETAG_ZONE_ID / SDK script)");
        }

        await showAd({ type: "end", ymid: result.ymid, requestVar: "support_button" });

        setMessage({ text: "Thank you for supporting Raja Mantri Chor Sipahi! 🎉", kind: "success" });
      } catch (err) {
        console.error(err);
        setMessage({ text: "The ad couldn't be shown. Please try again in a moment.", kind: "error" });
      }
    });
  }

  return (
    <>
      <button className="support-btn" onClick={handleClick} disabled={isPending || limitReached}>
        ❤️ Support (Watch an Ad)
      </button>

      <div className="counter">
        <strong>{used}</strong> / {limit} ads watched today
      </div>

      {message && <div className={`message ${message.kind}`}>{message.text}</div>}
    </>
  );
}
