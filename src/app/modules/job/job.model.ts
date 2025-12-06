import { Schema, model } from "mongoose";
import { JobStatus } from "./job.constant";
import { IJob } from "./job.interface";

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

    slug: {
      type: String,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    serviceCategory: {
      type: String,
      ref: "Service",
      required: true,
    },

    requiredSkills: {
      type: [String],
      default: [],
    },

    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "expert"],
      default: "beginner",
    },

    projectDuration: {
      type: String,
      default: null,
    },

    numFreelancers: {
      type: Number,
      default: 1,
    },

    budget: {
      type: Number,
      default: null,
    },

    jobType: {
      type: String,
      enum: ["fixed", "hourly"],
      default: "fixed",
    },

    timeline: {
      type: String,
      default: null,
    },

    attachments: {
      type: [String],
      default: [],
    },

    deadline: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.OPEN,
    },

    applicationCount: {
      type: Number,
      default: 0,
    },

    applicants: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Job = model<IJob>("Job", jobSchema);

export default Job;
