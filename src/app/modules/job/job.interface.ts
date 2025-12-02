import { Document, Types } from "mongoose";
import { JobStatus } from "./job.constant";

export interface IJob extends Document {
  clientId: Types.ObjectId;
  title: string;
  description: string;
  budget: number | null;
  timeline: string | null;
  requiredSkills: string[];
  status: JobStatus;
}
