import { Document, Types } from "mongoose";

export enum BudgetPreference {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum CompanySize {
  SOLO = "solo",
  SMALL = "1-10",
  MEDIUM = "11-50",
  LARGE = "51-200",
  XL = "201-500",
  ENTERPRISE = "500+",
}

export interface IClient extends Document {
  userId: Types.ObjectId;
  company?: string;
  website?: string;
  bio?: string;
  location?: string;
  experience?: number;
  rating?: number;
  designation?: string;
  companySize: CompanySize;
  budgetPreference: BudgetPreference;
  isVerifiedClient: boolean;
  isProfileComplete: boolean;
}
