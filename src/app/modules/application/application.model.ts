import { Schema, model } from "mongoose";
import { ApplicationStatus, IApplication } from "./application.interface";

const applicationSchema = new Schema<IApplication>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    freelancerId: {
      type: Schema.Types.ObjectId,
      ref: "Freelancer",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ jobId: 1, freelancerId: 1 }, { unique: true });

export const Application = model<IApplication>(
  "Application",
  applicationSchema
);
