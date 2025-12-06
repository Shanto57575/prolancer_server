/* eslint-disable @typescript-eslint/no-explicit-any */
import { isValidObjectId, Types } from "mongoose";
import { AppError } from "../../utils/AppError";
import Job from "./job.model";
import Client from "../client/client.model";
import modelQuery from "../../utils/modelQuery";
import User from "../user/user.model";
import { IJob } from "./job.interface";
import { JobStatus } from "./job.constant";

const createJob = async (payload: Partial<IJob> & { userId: string }) => {
  const {
    userId,
    title,
    description,
    budget,
    timeline,
    requiredSkills,
    serviceCategory,
    jobType,
    experienceLevel,
    projectDuration,
    numFreelancers,
    attachments,
    deadline,
  } = payload;

  if (!isValidObjectId(userId)) throw new AppError(400, "Invalid user id");
  if (!title) throw new AppError(400, "Title is required");
  if (!description) throw new AppError(400, "Description is required");
  if (!serviceCategory) throw new AppError(400, "Service category is required");

  const client = await Client.findOne({ userId });
  if (!client) throw new AppError(404, "Client profile not found");
  if (!client.isProfileComplete) {
    throw new AppError(403, "Please complete your profile to post a job");
  }

  let slug = title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
  slug = `${slug}-${Date.now().toString(36)}`;

  const job = await Job.create({
    clientId: userId,
    title,
    slug,
    description,
    budget: budget ?? null,
    timeline: timeline ?? null,
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
    serviceCategory,
    jobType: jobType || "fixed",
    experienceLevel: experienceLevel || "beginner",
    projectDuration: projectDuration ?? null,
    numFreelancers: numFreelancers ?? 1,
    attachments: Array.isArray(attachments) ? attachments : [],
    deadline: deadline ?? null,
    status: JobStatus.OPEN,
    isDeleted: false,
  });

  return job;
};

const getAllJobs = async (options: any) => {
  const filters = { ...options.filters, isDeleted: false };
  console.log({ filters });

  return modelQuery(Job, {
    page: options.page,
    limit: options.limit,
    search: options.search,
    sortBy: options.sortBy,
    sortOrder: options.sortOrder,
    searchableFields: ["title", "description", "requiredSkills"],
    filters,
    projection: { applicants: 0 },
    populate: { path: "serviceCategory", select: "name" },
  });
};

const getMyJobs = async (userId: string, options: any) => {
  if (!isValidObjectId(userId)) throw new AppError(400, "Invalid user id");

  const filters = {
    ...options.filters,
    clientId: new Types.ObjectId(userId),
    isDeleted: false,
  };

  const response = await modelQuery(Job, {
    page: options.page,
    limit: options.limit,
    search: options.search,
    sortBy: options.sortBy,
    sortOrder: options.sortOrder,
    searchableFields: ["title", "description"],
    filters,
    populate: { path: "serviceCategory", select: "name" },
  });

  return response;
};

const getJobBySlug = async (slug: string) => {
  const query = { slug, isDeleted: false };

  const job = await Job.findOne(query)
    .populate({
      path: "clientId",
      select: "name email profilePicture",
      model: User,
    })
    .populate({
      path: "serviceCategory",
      select: "name",
    });

  if (!job) throw new AppError(404, "Job not found");
  return job;
};

const updateJob = async (
  idOrSlug: string,
  userId: string,
  payload: Partial<IJob>
) => {
  const query = isValidObjectId(idOrSlug)
    ? { _id: idOrSlug, isDeleted: false }
    : { slug: idOrSlug, isDeleted: false };

  const job = await Job.findOne(query);
  if (!job) throw new AppError(404, "Job not found");

  if (job.clientId.toString() !== userId) {
    throw new AppError(403, "You are not authorized to update this job");
  }

  const allowedUpdates = [
    "title",
    "description",
    "budget",
    "timeline",
    "requiredSkills",
    "serviceCategory",
    "jobType",
    "status",
    "deadline",
    "experienceLevel",
    "projectDuration",
    "numFreelancers",
    "attachments",
  ];

  const updates: Record<string, any> = {};
  for (const key of allowedUpdates) {
    if (key in payload) {
      updates[key] = (payload as any)[key];
    }
  }

  const updatedJob = await Job.findOneAndUpdate(query, updates, {
    new: true,
    runValidators: true,
  });

  return updatedJob;
};

const deleteJob = async (idOrSlug: string, userId: string) => {
  const query = isValidObjectId(idOrSlug)
    ? { _id: idOrSlug, isDeleted: false }
    : { slug: idOrSlug, isDeleted: false };

  const job = await Job.findOne(query);
  if (!job) throw new AppError(404, "Job not found");

  if (job.clientId.toString() !== userId) {
    throw new AppError(403, "You are not authorized to delete this job");
  }

  job.isDeleted = true;
  await job.save();
  return job;
};

export const jobService = {
  createJob,
  getAllJobs,
  getMyJobs,
  getJobBySlug,
  updateJob,
  deleteJob,
};
