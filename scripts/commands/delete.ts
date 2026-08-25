import { r2Client } from "../shared";

export async function cmdDelete(args: string[]) {
  const key = args[0];
  if (!key) {
    console.error("Usage: bun scripts/cli.ts delete <r2-key>");
    console.error("Run `bun scripts/cli.ts list` to see available keys.");
    process.exit(1);
  }

  const client = r2Client();
  const exists = await client.exists(key);
  if (!exists) {
    console.error(`No object found at key: ${key}`);
    process.exit(1);
  }

  await client.delete(key);
  console.log(`Deleted: ${key}`);
  console.log(
    "Note: this only removes the file from R2. If it was the currently published\n" +
      "version, the download page will now point at a broken link until you\n" +
      "`upload` a new one."
  );
}
