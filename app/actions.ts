"use server";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import AdAttempt from "@/lib/models/AdAttempt";
import { config } from "@/lib/config";
import { startOfTodayUTC } from "@/lib/date";
import { SUPPORTER_COOKIE_NAME } from "@/lib/supporter";

type AttemptResult =
  | { ok: true; ymid: string; used: number; limit: number }
  | { ok: false; used: number; limit: number };

// Called directly from the client's onClick handler (see support-card.tsx).
// Framework protections aren't a security boundary by themselves, so this
// re-checks the limit itself rather than trusting anything the client sent.
export async function requestAdAttempt(): Promise<AttemptResult> {
  await dbConnect();

  const cookieStore = await cookies();
  let supporterId = cookieStore.get(SUPPORTER_COOKIE_NAME)?.value;

  if (!supporterId) {
    supporterId = crypto.randomUUID();
    cookieStore.set(SUPPORTER_COOKIE_NAME, supporterId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365
    });
  }

  const used = await AdAttempt.countDocuments({
    supporterId,
    createdAt: { $gte: startOfTodayUTC() }
  });

  if (used >= config.dailyAdLimit) {
    return { ok: false, used, limit: config.dailyAdLimit };
  }

  const ymid = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + config.attemptTtlMinutes * 60_000);

  await AdAttempt.create({ ymid, supporterId, expiresAt });

  return { ok: true, ymid, used: used + 1, limit: config.dailyAdLimit };
}
