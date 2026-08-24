import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const adEventSchema = new Schema(
  {
    ymid: { type: String, required: true },
    supporterId: { type: String, required: true, index: true },
    eventType: { type: String, enum: ["impression", "click"], required: true },
    // Monetag's macro value is "not_valued" (not "non_valued").
    rewardEventType: { type: String, enum: ["valued", "not_valued"], required: true },
    estimatedPrice: { type: Number, default: 0 },
    zoneId: Number,
    subZoneId: Number,
    requestVar: String
  },
  { timestamps: true }
);

// A single ad can legitimately produce two postbacks -- an impression and a
// click -- both carrying the same ymid. Dedupe on the pair, not ymid alone,
// or the second postback silently disappears.
adEventSchema.index({ ymid: 1, eventType: 1 }, { unique: true });

export type AdEventDoc = InferSchemaType<typeof adEventSchema>;

export default (models.AdEvent as mongoose.Model<AdEventDoc>) || model("AdEvent", adEventSchema);
