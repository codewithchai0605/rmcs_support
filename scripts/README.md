# App-version CLI

Publishes a new release APK: uploads it to Cloudflare R2 with Bun's native
`S3Client` (no `aws-sdk`/`@aws-sdk/client-s3` dependency), then updates the
single `AppVersion` document in MongoDB that `/download` reads from.

## Setup

The CLI reads the same `.env` as the Next.js app (Bun loads it
automatically), plus one variable Next.js doesn't need:

- `MONGODB_URI` — must be reachable from wherever you run the CLI. If
  you're running it from your dev machine against a production database,
  that means an Atlas connection string, not `mongodb://127.0.0.1`.
- `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
  `R2_BUCKET_NAME` — already in `.env`.
- `R2_PUBLIC_BASE_URL` — **not** set yet; see the comment above it in
  `.env`. R2 doesn't expose a public URL by default, so this has to be
  either the bucket's r2.dev URL (Cloudflare dashboard → your bucket →
  Settings → enable "Public access", or **Settings → Public Development
  URL**) or a custom domain you've connected to the bucket.

## Commands

```bash
# Upload a build and publish it (uses the default Flutter output path
# unless you pass --apk)
bun scripts/cli.ts upload --version 1.4.2 --build 42

# ...with an explicit APK path and release notes
bun scripts/cli.ts upload --apk "C:\path\to\app.apk" --version 1.4.2 --build 42 --notes "Fixed the Sipahi card bug"

# See what's currently published on the download page
bun scripts/cli.ts show

# List every APK sitting in the bucket's apks/ prefix
bun scripts/cli.ts list

# Remove an old APK from R2 (does not touch the published version record)
bun scripts/cli.ts delete apks/app-v1.4.1-build41.apk
```

Or via the package.json script, forwarding args the same way:

```bash
bun run cli upload --version 1.4.2 --build 42
```

## Design notes

- **Every upload gets its own key** (`apks/app-v{version}-build{buildNumber}.apk`)
  rather than overwriting a single `latest.apk`. Old builds stay in the
  bucket as a rollback trail — `delete` is there for when you want to
  clean them up.
- **The published version is a single upserted document**, not a new row
  per release (per the original ask) — see `APP_VERSION_ID` in
  `lib/models/AppVersion.ts`. `show` and the download page both just read
  that one document.
- **`upload` runs Mongoose validators on the upsert** (`runValidators: true`)
  so a malformed `--build` value fails the CLI loudly instead of quietly
  writing bad data that only shows up later on the download page.
