import { Document, Types } from "mongoose";

export interface IFreelancer extends Document {
  userId: Types.ObjectId;
  bio?: string;
  skills: string[];
  portfolio?: string;
  otherWebsiteLink?: string;
  linkedinLink?: string;
  resume?: string;
  hourlyRate?: number;
  experience?: number;
  rating?: number;
  location?: string;
  designation?: string;
}
