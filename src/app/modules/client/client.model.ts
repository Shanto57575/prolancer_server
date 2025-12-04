import { Schema, model } from "mongoose";
import { BudgetPreference, CompanySize, IClient } from "./client.interface";

const clientSchema = new Schema<IClient>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    company: String,
    website: String,
    bio: String,
    location: String,
    experience: Number,
    rating: Number,
    designation: String,
    companySize: {
      type: String,
      enum: Object.values(CompanySize),
      default: CompanySize.SMALL,
    },
    budgetPreference: {
      type: String,
      enum: Object.values(BudgetPreference),
      default: BudgetPreference.LOW,
    },
    isVerifiedClient: { type: Boolean, default: true },
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Client = model<IClient>("Client", clientSchema);

export default Client;
