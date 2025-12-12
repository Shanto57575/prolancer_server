import { Document } from "mongoose";

export enum UserRole {
  ADMIN = "ADMIN",
  CLIENT = "CLIENT",
  FREELANCER = "FREELANCER",
}

export enum SubscriptionPlan {
  FREE = "FREE",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export interface IAuthProvider {
  provider: string;
  providerId: string;
  isVerified: boolean;
}

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  role: string;
  isVerified: boolean;
  isBanned: boolean;
  authProviders: IAuthProvider[];
  profilePicture?: string;
  // Subscription fields
  isPremium: boolean;
  subscriptionPlan: SubscriptionPlan;
  subscriptionEndDate?: Date;
  stripeCustomerId?: string;
}
