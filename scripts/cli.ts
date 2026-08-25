#!/usr/bin/env bun
// App-version CLI: uploads a release APK to Cloudflare R2 (via Bun's native
// S3Client -- no aws-sdk dependency) and updates the single AppVersion
// document that the /download page reads from.
//
// Usage:
//   bun scripts/cli.ts upload --version 1.4.2 --build 42 [--apk <path>] [--notes "..."]
//   bun scripts/cli.ts show
//   bun scripts/cli.ts list
//   bun scripts/cli.ts delete <r2-key>
//
// Requires these variables in .env (see .env for the R2/Mongo ones already
// there, and README.md for what to add):
//   CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
//   R2_BUCKET_NAME, R2_PUBLIC_BASE_URL, MONGODB_URI

import { cmdUpload } from "./commands/upload";
import { cmdShow } from "./commands/show";
import { cmdList } from "./commands/list";
import { cmdDelete } from "./commands/delete";

function printHelp() {
  console.log(`App-version CLI

Usage:
  bun scripts/cli.ts upload --version <x.y.z> --build <n> [--apk <path>] [--notes "..."]
  bun scripts/cli.ts show
  bun scripts/cli.ts list
  bun scripts/cli.ts delete <r2-key>

Commands:
  upload   Upload an APK to R2 and publish it as the current version
  show     Print the version currently published on the download page
  list     List APKs sitting in the R2 bucket's apks/ prefix
  delete   Remove one APK object from R2 (does not touch the DB record)
`);
}

async function main() {
  const [, , command, ...rest] = process.argv;

  switch (command) {
    case "upload":
      await cmdUpload(rest);
      break;
    case "show":
      await cmdShow();
      break;
    case "list":
      await cmdList();
      break;
    case "delete":
      await cmdDelete(rest);
      break;
    case undefined:
    case "help":
    case "--help":
    case "-h":
      printHelp();
      break;
    default:
      console.error(`Unknown command: ${command}\n`);
      printHelp();
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("\n✖", error instanceof Error ? error.message : error);
  process.exit(1);
});
