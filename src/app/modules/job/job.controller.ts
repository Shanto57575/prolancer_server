/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { jobService } from "./job.service";
import { AppError } from "../../utils/AppError";

const createJob = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "Unauthorized Access");

  const result = await jobService.createJob({ ...req.body, userId });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Job created successfully",
    data: result,
  });
});

const getAllJobs = catchAsync(async (req: Request, res: Response) => {
  const filters = { ...req.query };
  const excludeFields = ["page", "limit", "sortBy", "sortOrder", "search"];
  excludeFields.forEach((field) => delete filters[field]);

  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as "asc" | "desc",
    search: req.query.search as string,
    filters,
  };

  const result = await jobService.getAllJobs(options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Jobs fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getMyJobs = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "Unauthorized");

  const filters = { ...req.query };
  const excludeFields = ["page", "limit", "sortBy", "sortOrder", "search"];
  excludeFields.forEach((field) => delete filters[field]);

  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as "asc" | "desc",
    search: req.query.search as string,
    filters,
  };

  const result = await jobService.getMyJobs(userId, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "My jobs fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getJobById = catchAsync(async (req: Request, res: Response) => {
  const result = await jobService.getJobById(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Job fetched successfully",
    data: result,
  });
});

const updateJob = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "Unauthorized");

  const result = await jobService.updateJob(
    req.params.id as string,
    userId,
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Job updated successfully",
    data: result,
  });
});

const deleteJob = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "Unauthorized Access");

  const result = await jobService.deleteJob(req.params.id as string, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Job deleted successfully",
    data: result,
  });
});

export const jobController = {
  createJob,
  getAllJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
};
