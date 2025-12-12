import { Schema, model, Document } from "mongoose";

interface IStripeEvent extends Document {
  eventId: string;
  eventType: string;
  processed: boolean;
  sessionId?: string;
}

const StripeEventSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true },
    eventType: { type: String, required: true },
    processed: { type: Boolean, default: true },
    sessionId: { type: String },
  },
  { timestamps: true }
);

// Index for fast lookups
StripeEventSchema.index({ eventId: 1 });

export const StripeEvent = model<IStripeEvent>(
  "StripeEvent",
  StripeEventSchema
);
