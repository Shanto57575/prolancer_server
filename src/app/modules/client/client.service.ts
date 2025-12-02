/* eslint-disable @typescript-eslint/no-explicit-any */
import { isValidObjectId } from "mongoose";
import { AppError } from "../../utils/AppError";
import Client from "./client.model";
import User from "../user/user.model";
import modelQuery from "../../utils/modelQuery";
import Job from "../job/job.model";

const getByUserId = async (userId: string) => {
  if (!isValidObjectId(userId)) throw new AppError(400, "Invalid user id");
  const profile = await Client.findOne({ userId }).populate({
    path: "userId",
    select: "name email profilePicture",
    model: User,
  });
  if (!profile) throw new AppError(404, "Client profile not found");
  return profile;
};

const updateByUserId = async (userId: string, payload: Record<string, any>) => {
  if (!isValidObjectId(userId)) throw new AppError(400, "Invalid user id");
  const profile = await Client.findOneAndUpdate({ userId }, payload, {
    new: true,
    runValidators: true,
  }).populate({
    path: "userId",
    select: "name email profilePicture",
    model: User,
  });
  if (!profile) throw new AppError(404, "Client profile not found");
  return profile;
};

const createJob = async (payload: {
  userId: string;
  title: string;
  description: string;
  budget?: number;
  timeline?: string;
  requiredSkills?: string[];
}) => {
  const { userId, title, description, budget, timeline, requiredSkills } =
    payload;
  if (!isValidObjectId(userId)) throw new AppError(400, "Invalid user id");

  // Ensure client profile exists
  const clientProfile = await Client.findOne({ userId });
  if (!clientProfile) throw new AppError(404, "Client profile not found");

  const job = await Job.create({
    clientId: userId,
    title,
    description,
    budget: budget ?? null,
    timeline: timeline ?? null,
    requiredSkills: Array.isArray(requiredSkills)
      ? requiredSkills
      : requiredSkills
      ? [requiredSkills]
      : [],
    status: "open",
  });

  return job;
};

const getJobsByClient = async (userId: string) => {
  if (!isValidObjectId(userId)) throw new AppError(400, "Invalid user id");
  const jobs = await Job.find({ clientId: userId })
    .sort({ createdAt: -1 })
    .lean()
    .exec();
  return jobs;
};

const getJobById = async (id: string) => {
  if (!isValidObjectId(id)) throw new AppError(400, "Invalid job id");
  const job = await Job.findById(id).populate({
    path: "clientId",
    select: "name email",
    model: User,
  });
  if (!job) throw new AppError(404, "Job not found");
  return job;
};

const listJobs = async (options: any) => {
  return modelQuery(Job, {
    page: options.page,
    limit: options.limit,
    search: options.search,
    searchableFields: ["title", "description", "requiredSkills"],
    filters: {
      min_budget: options.filters?.minBudget,
      max_budget: options.filters?.maxBudget,
      status: options.filters?.status,
    },
  });
};

export const clientService = {
  getByUserId,
  updateByUserId,
  createJob,
  getJobsByClient,
  getJobById,
  listJobs,
};
