import "server-only";
import { cookies } from "next/headers";
import dbConnect from "./mongodb";
import AdAttempt from "./models/AdAttempt";
import AppVersion, { APP_VERSION_ID } from "./models/AppVersion";
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

// Returns null when nobody has published a release yet (fresh install,
// before the CLI's `upload` command has ever run) -- the download page
// renders a "coming soon" state in that case instead of erroring.
export async function getLatestAppVersion() {
  await dbConnect();
  const doc = await AppVersion.findById(APP_VERSION_ID).lean();
  if (!doc) return null;

  return {
    version: doc.version,
    buildNumber: doc.buildNumber,
    apkUrl: doc.apkUrl,
    fileSizeBytes: doc.fileSizeBytes ?? null,
    releaseNotes: doc.releaseNotes ?? null,
    updatedAt: doc.updatedAt as Date
  };
}
