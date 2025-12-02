import { Schema, model } from "mongoose";
import { IJob } from "./job.interface.js";
import { JobStatus } from "./job.constant.js";

const jobSchema = new Schema<IJob>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    budget: {
      type: Number,
      default: null,
    },
    timeline: {
      type: String,
      default: null,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.OPEN,
    },
  },
  { timestamps: true }
);

const Job = model<IJob>("Job", jobSchema);

export default Job;
