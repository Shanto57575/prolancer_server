/* eslint-disable @typescript-eslint/no-explicit-any */
import { isValidObjectId } from "mongoose";
import { AppError } from "../../utils/AppError";
import Freelancer from "../freelancer/freelancer.model";
import { checkFreelancerProfileComplete } from "../../utils/profileCompletion";
import Job from "../job/job.model";
import { Application } from "./application.model";
import modelQuery from "../../utils/modelQuery";
import { JobStatus } from "../job/job.constant";
import { ApplicationStatus } from "./application.interface";

const createApplication = async (payload: {
  userId: string;
  jobId: string;
}) => {
  const { userId, jobId: idOrSlug } = payload;

  if (!isValidObjectId(userId)) {
    throw new AppError(400, "Invalid User IDs provided");
  }

  // 1. Verify Requestor is a Freelancer
  const freelancer = await Freelancer.findOne({ userId });
  if (!freelancer) {
    throw new AppError(403, "Only freelancers can apply for jobs");
  }

  // 2. Check Profile Completion
  const isProfileComplete = checkFreelancerProfileComplete(freelancer);
  if (!isProfileComplete) {
    throw new AppError(
      400,
      "Your profile is incomplete. Please complete your profile to apply."
    );
  }

  // 3. Check Job Existence and Status
  const jobQuery = isValidObjectId(idOrSlug)
    ? { _id: idOrSlug, isDeleted: false }
    : { slug: idOrSlug, isDeleted: false };

  const job = await Job.findOne(jobQuery);
  if (!job) {
    throw new AppError(404, "Job not found");
  }
  if (job.status !== JobStatus.OPEN) {
    throw new AppError(400, "This job is no longer accepting applications");
  }

  const jobId = job._id;

  // 4. Prevent Duplicate Applications
  const existingApplication = await Application.findOne({
    jobId,
    freelancerId: userId,
  });
  if (existingApplication) {
    throw new AppError(400, "You have already applied for this job");
  }

  // 5. Create Application (Sequential, no transaction for dev env stability)
  // 5. Create Application (Sequential, no transaction for dev env stability)
  const application = await Application.create({
    jobId,
    freelancerId: freelancer._id,
    status: "pending",
  });

  // 6. Update Job Stats
  if (application) {
    await Job.findByIdAndUpdate(jobId, {
      $push: { applicants: userId },
      $inc: { applicationCount: 1 },
    });
  }

  return application;
};

const getMyApplications = async (userId: string, options: any) => {
  const freelancer = await Freelancer.findOne({ userId });
  if (!freelancer) {
    throw new AppError(404, "Freelancer profile not found");
  }

  const filters = {
    ...options.filters,
    freelancerId: freelancer._id,
  };

  return modelQuery(Application, {
    page: options.page,
    limit: options.limit,
    sortBy: options.sortBy,
    sortOrder: options.sortOrder,
    filters,
    populate: {
      path: "jobId",
      select: "title slug serviceCategory jobType budget deadline status",
      populate: { path: "serviceCategory", select: "name" },
    },
  });
};

const getApplicationsByJobId = async (
  idOrSlug: string,
  userId: string,
  options: any
) => {
  const jobQuery = isValidObjectId(idOrSlug)
    ? { _id: idOrSlug, isDeleted: false }
    : { slug: idOrSlug, isDeleted: false };

  // Verify ownership
  const job = await Job.findOne(jobQuery);
  if (!job) throw new AppError(404, "Job not found");
  if (job.clientId.toString() !== userId) {
    throw new AppError(
      403,
      "You are not authorized to view applications for this job"
    );
  }

  const filters = {
    ...options.filters,
    jobId: job._id,
  };

  return modelQuery(Application, {
    page: options.page,
    limit: options.limit,
    sortBy: options.sortBy,
    sortOrder: options.sortOrder,
    filters,
    populate: {
      path: "freelancerId",
      select: "bio skills hourlyRate rating location profilePicture", // Select freelancer basic info
      populate: { path: "userId", select: "name email profilePicture" }, // User details
    },
  });
};

const updateApplicationStatus = async (
  applicationId: string,
  status: "accepted" | "rejected",
  userId: string
) => {
  if (!isValidObjectId(applicationId)) {
    throw new AppError(400, "Invalid application ID");
  }

  const application = await Application.findById(applicationId).populate(
    "jobId"
  );
  if (!application) {
    throw new AppError(404, "Application not found");
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const job = application.jobId;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const jobClientId = (job as any).clientId;

  if (jobClientId.toString() !== userId) {
    throw new AppError(
      403,
      "You are not authorized to update this application"
    );
  }

  application.status = status as ApplicationStatus;
  await application.save();

  // If application is accepted, create a chat room
  if (status === "accepted") {
    // lazy load chatService to avoid circular dependency if any
    const { chatService } = await import("../chat/chat.service");

    await chatService.createChatRoom(
      (job as any)._id,
      (job as any).clientId,
      application.freelancerId.toString()
    );
  }

  return application;
};

export const applicationService = {
  createApplication,
  getMyApplications,
  getApplicationsByJobId,
  updateApplicationStatus,
};
