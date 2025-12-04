import { Document, Types } from "mongoose";

export enum Availability {
  FullTime = "Full-Time",
  PartTime = "Part-Time",
  Hourly = "Hourly",
}

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
  languages: string[];
  education: string[];
  availability: Availability;
  isProfileComplete: boolean;
}
