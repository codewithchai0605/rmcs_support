import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

// There's only ever one "latest release" -- the download page and the CLI
// both just want the current version, not a history table. Rather than
// querying with `.findOne().sort({ createdAt: -1 })` (and needing an index
// to make that fast), we fix the _id and always upsert the same document.
// findById(APP_VERSION_ID) is a single indexed lookup by primary key.
export const APP_VERSION_ID = "latest";

const appVersionSchema = new Schema(
  {
    // Overrides Mongoose's default auto-generated ObjectId _id with our
    // fixed string id above, so there's exactly one row in this collection.
    _id: { type: String, default: APP_VERSION_ID },
    version: { type: String, required: true }, // human-readable, e.g. "1.4.2"
    buildNumber: { type: Number, required: true }, // e.g. 42, should increase every release
    apkUrl: { type: String, required: true }, // public Cloudflare R2 URL
    fileSizeBytes: { type: Number },
    releaseNotes: { type: String }
  },
  { timestamps: true }
);

export type AppVersionDoc = InferSchemaType<typeof appVersionSchema>;

// The `models.AppVersion || model(...)` guard prevents a "Cannot overwrite
// model" error when this module gets re-evaluated during dev hot reloads.
export default (models.AppVersion as mongoose.Model<AppVersionDoc>) ||
  model("AppVersion", appVersionSchema);
