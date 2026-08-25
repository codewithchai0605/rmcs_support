import { r2Client } from "../shared";
import { formatBytes } from "../../lib/format";

export async function cmdList() {
  const client = r2Client();
  const result = await client.list({ prefix: "apks/", maxKeys: 200 });

  const objects = result.contents ?? [];
  if (objects.length === 0) {
    console.log("No APKs in the bucket yet.");
    return;
  }

  console.log(`${objects.length} object(s) under apks/:\n`);
  for (const obj of objects) {
    const modified = obj.lastModified ? new Date(obj.lastModified).toLocaleString() : "—";
    console.log(`  ${obj.key}`);
    console.log(`    ${formatBytes(obj.size)} · modified ${modified}`);
  }

  if (result.isTruncated) {
    console.log("\n(more objects exist beyond this page)");
  }
}
