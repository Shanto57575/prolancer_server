import { Document, Types } from "mongoose";
import { JobStatus } from "./job.constant";

export interface IJob extends Document {
  clientId: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  serviceCategory: string;
  requiredSkills: string[];

  experienceLevel: "beginner" | "intermediate" | "expert";
  projectDuration: string | null;
  numFreelancers: number;

  budget: number | null;
  jobType: "fixed" | "hourly";
  timeline: string | null;

  attachments: string[];

  deadline: Date | null;

  status: JobStatus;
  applicationCount: number;
  applicants: Types.ObjectId[];

  createdAt?: Date;
  updatedAt?: Date;
}
