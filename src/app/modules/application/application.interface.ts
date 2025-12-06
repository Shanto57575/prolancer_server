import { Document, Types } from "mongoose";

export enum ApplicationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export interface IApplication extends Document {
  jobId: Types.ObjectId;
  freelancerId: Types.ObjectId;
  status: ApplicationStatus;
  appliedAt: Date;
}
