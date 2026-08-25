import { parseArgs } from "node:util";
import path from "node:path";
import mongoose from "mongoose";
import dbConnect from "../../lib/mongodb";
import AppVersion, { APP_VERSION_ID } from "../../lib/models/AppVersion";
import { formatBytes } from "../../lib/format";
import { r2Client, publicUrlFor, printVersion } from "../shared";

// Matches the Flutter release build's default output path -- override with
// --apk if you build somewhere else or run this from a different machine.
const DEFAULT_APK_PATH =
  "C:\\Users\\sanje\\Desktop\\coding\\raja-mantri\\rmcs_frontend\\build\\app\\outputs\\flutter-apk\\app-arm64-v8a-release.apk";

function usage(): never {
  console.error(
    'Usage: bun scripts/cli.ts upload --version <x.y.z> --build <n> [--apk <path>] [--notes "..."]'
  );
  process.exit(1);
}

export async function cmdUpload(args: string[]) {
  const { values } = parseArgs({
    args,
    options: {
      apk: { type: "string" },
      version: { type: "string" },
      build: { type: "string" },
      notes: { type: "string" }
    }
  });

  if (!values.version || !values.build) usage();

  const version = values.version;
  const buildNumber = Number(values.build);
  if (!Number.isInteger(buildNumber) || buildNumber < 0) {
    console.error(`--build must be a non-negative whole number, got: ${values.build}`);
    process.exit(1);
  }

  const apkPath = path.resolve(values.apk ?? DEFAULT_APK_PATH);
  const localFile = Bun.file(apkPath);
  if (!(await localFile.exists())) {
    console.error(`APK not found at: ${apkPath}`);
    console.error("Pass a different path with --apk <path> if it built somewhere else.");
    process.exit(1);
  }

  const size = localFile.size;
  console.log(`Uploading ${apkPath}`);
  console.log(`  size: ${formatBytes(size)}`);

  const client = r2Client();
  const key = `apks/app-v${version}-build${buildNumber}.apk`;

  // BunFile is Blob-like, so S3File.write() can take it directly and Bun
  // streams it (with automatic multipart upload for large files) without
  // us having to read the whole APK into memory first.
  await client.file(key).write(localFile, {
    type: "application/vnd.android.package-archive",
    contentDisposition: `attachment; filename="RajaMantriChorSipahi-v${version}.apk"`
  });

  const apkUrl = publicUrlFor(key);
  console.log(`Uploaded to R2: ${key}`);

  await dbConnect();
  const doc = await AppVersion.findByIdAndUpdate(
    APP_VERSION_ID,
    {
      version,
      buildNumber,
      apkUrl,
      fileSizeBytes: size,
      // Only overwrite releaseNotes when --notes was actually passed, so a
      // re-upload without --notes doesn't wipe out notes set earlier.
      ...(values.notes !== undefined ? { releaseNotes: values.notes } : {})
    },
    { upsert: true, new: true, runValidators: true }
  ).lean();

  console.log("\n✅ Published:");
  printVersion(doc!);

  await mongoose.connection.close();
}
