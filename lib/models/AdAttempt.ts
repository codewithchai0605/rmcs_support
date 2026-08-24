import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const adAttemptSchema = new Schema(
  {
    ymid: { type: String, required: true, unique: true },
    supporterId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "consumed", "expired"],
      default: "pending"
    },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

export type AdAttemptDoc = InferSchemaType<typeof adAttemptSchema>;

// The `models.AdAttempt || model(...)` guard prevents a "Cannot overwrite
// model" error when this module gets re-evaluated during dev hot reloads.
export default (models.AdAttempt as mongoose.Model<AdAttemptDoc>) ||
  model("AdAttempt", adAttemptSchema);
