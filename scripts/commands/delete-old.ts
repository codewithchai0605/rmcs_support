import { parseArgs } from "node:util";
import { r2Client } from "../shared";

const APK_PREFIX = "apks/";

export async function cmdDeleteOld(args: string[]) {
  const { values } = parseArgs({
    args,
    options: {
      "dry-run": { type: "boolean" }
    }
  });

  const client = r2Client();
  const objects: { key: string; lastModified?: string }[] = [];
  let continuationToken: string | undefined;

  do {
    const result = await client.list({
      prefix: APK_PREFIX,
      maxKeys: 1000,
      ...(continuationToken ? { continuationToken } : {})
    });

    objects.push(
      ...(result.contents ?? [])
        .filter((object) => object.key.endsWith(".apk"))
        .map((object) => ({ key: object.key, lastModified: object.lastModified }))
    );
    continuationToken = result.isTruncated ? result.nextContinuationToken : undefined;
  } while (continuationToken);

  if (objects.length <= 1) {
    console.log(
      objects.length === 0
        ? "No APKs in the bucket yet."
        : `Only one APK found; keeping ${objects[0].key}.`
    );
    return;
  }

  const latest = objects.reduce((current, candidate) => {
    const currentTime = current.lastModified ? Date.parse(current.lastModified) : 0;
    const candidateTime = candidate.lastModified ? Date.parse(candidate.lastModified) : 0;
    if (candidateTime > currentTime) return candidate;
    if (candidateTime === currentTime && candidate.key > current.key) return candidate;
    return current;
  });
  const oldObjects = objects.filter((object) => object.key !== latest.key);

  console.log(`Keeping latest APK: ${latest.key}`);
  console.log(`${values["dry-run"] ? "Would delete" : "Deleting"} ${oldObjects.length} old APK(s):`);

  if (values["dry-run"]) {
    for (const object of oldObjects) console.log(`  ${object.key}`);
    return;
  }

  for (const object of oldObjects) {
    await client.delete(object.key);
    console.log(`  Deleted: ${object.key}`);
  }
}