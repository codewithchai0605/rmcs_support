import "server-only";
import { cookies } from "next/headers";
import dbConnect from "./mongodb";
import AdAttempt from "./models/AdAttempt";
import { config } from "./config";
import { startOfTodayUTC } from "./date";
import { SUPPORTER_COOKIE_NAME } from "./supporter";

export async function getInitialAdStatus() {
  const cookieStore = await cookies();
  const supporterId = cookieStore.get(SUPPORTER_COOKIE_NAME)?.value;

  // No cookie yet means this browser has never requested an ad -- it's
  // minted lazily on first click, inside the requestAdAttempt Server Action.
  if (!supporterId) {
    return { used: 0, limit: config.dailyAdLimit };
  }

  await dbConnect();

  const used = await AdAttempt.countDocuments({
    supporterId,
    createdAt: { $gte: startOfTodayUTC() }
  });

  return { used, limit: config.dailyAdLimit };
}
