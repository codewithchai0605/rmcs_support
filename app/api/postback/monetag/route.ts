import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import dbConnect from "@/lib/mongodb";
import AdAttempt from "@/lib/models/AdAttempt";
import AdEvent from "@/lib/models/AdEvent";
import { config } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Constant-time comparison so the postback secret can't be brute-forced via
// response-timing differences.
function secretsMatch(provided: string, expected: string): boolean {
  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);
  if (providedBuf.length !== expectedBuf.length) {
    crypto.timingSafeEqual(expectedBuf, expectedBuf);
    return false;
  }
  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

function numberOrUndefined(value: string | null): number | undefined {
  if (!value) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

// Monetag calls this. Configure the postback URL in your Monetag dashboard as:
// https://YOUR_DOMAIN/api/postback/monetag?secret=YOUR_POSTBACK_SECRET&ymid={ymid}&zone_id={zone_id}&sub_zone_id={sub_zone_id}&request_var={request_var}&event_type={event_type}&reward_event_type={reward_event_type}&estimated_price={estimated_price}
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const providedSecret = params.get("secret");
  if (
    !providedSecret ||
    !config.postbackSecret ||
    !secretsMatch(providedSecret, config.postbackSecret)
  ) {
    return new NextResponse(null, { status: 403 });
  }

  const ymid = params.get("ymid");
  const eventType = params.get("event_type");
  const rewardEventType = params.get("reward_event_type");

  if (!ymid) return new NextResponse(null, { status: 400 });
  if (eventType !== "impression" && eventType !== "click") {
    return new NextResponse(null, { status: 400 });
  }
  if (rewardEventType !== "valued" && rewardEventType !== "not_valued") {
    return new NextResponse(null, { status: 400 });
  }

  await dbConnect();

  // Only store events for a ymid we actually issued -- otherwise anyone who
  // finds this URL could write arbitrary rows into the database.
  const attempt = await AdAttempt.findOne({ ymid });
  if (!attempt) {
    console.warn(`[postback] unknown ymid: ${ymid}`);
    // 200 so Monetag doesn't keep retrying an event we can never attribute.
    return new NextResponse(null, { status: 200 });
  }

  await AdAttempt.updateOne({ _id: attempt._id, status: "pending" }, { status: "consumed" });

  try {
    await AdEvent.create({
      ymid,
      supporterId: attempt.supporterId,
      eventType,
      rewardEventType,
      estimatedPrice: numberOrUndefined(params.get("estimated_price")) ?? 0,
      zoneId: numberOrUndefined(params.get("zone_id")),
      subZoneId: numberOrUndefined(params.get("sub_zone_id")),
      requestVar: params.get("request_var") ?? undefined
    });
  } catch (error: unknown) {
    // Duplicate (ymid, eventType) -- Monetag retried a postback we've
    // already stored. Expected and fine, not an error.
    const isDuplicateKeyError =
      typeof error === "object" && error !== null && "code" in error && error.code === 11000;
    if (!isDuplicateKeyError) throw error;
  }

  return new NextResponse(null, { status: 200 });
}
