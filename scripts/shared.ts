import { S3Client } from "bun";
import type { AppVersionDoc } from "../lib/models/AppVersion";
import { formatBytes } from "../lib/format";

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    console.error(`Add it to .env in the project root, then try again.`);
    process.exit(1);
  }
  return value;
}

// One R2Client per invocation -- this is a short-lived CLI process, not a
// long-running server, so there's no benefit to caching/reusing it across
// calls the way a Next.js route handler would.
export function r2Client(): S3Client {
  const accountId = requireEnv("CLOUDFLARE_ACCOUNT_ID");
  return new S3Client({
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    bucket: requireEnv("R2_BUCKET_NAME"),
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`
  });
}

// R2 has no default public URL -- you either turn on the bucket's r2.dev
// subdomain or attach a custom domain, and either way the base URL has to
// be typed in once. See README.md for how to get this value.
export function publicUrlFor(key: string): string {
  const base = requireEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/, "");
  return `${base}/${key}`;
}

export function printVersion(doc: Pick<
  AppVersionDoc,
  "version" | "buildNumber" | "apkUrl" | "fileSizeBytes" | "releaseNotes"
> & { updatedAt?: Date }) {
  console.log(`  version:      ${doc.version}`);
  console.log(`  buildNumber:  ${doc.buildNumber}`);
  console.log(`  apkUrl:       ${doc.apkUrl}`);
  console.log(`  size:         ${formatBytes(doc.fileSizeBytes)}`);
  if (doc.releaseNotes) console.log(`  releaseNotes: ${doc.releaseNotes}`);
  if (doc.updatedAt) console.log(`  updatedAt:    ${new Date(doc.updatedAt).toLocaleString()}`);
}
