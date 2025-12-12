import { Schema, model } from "mongoose";

const PaymentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    stripeSessionId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    plan: { type: String, required: true },
    status: { type: String, default: "succeeded" },
  },
  { timestamps: true }
);

export const Payment = model("Payment", PaymentSchema);
