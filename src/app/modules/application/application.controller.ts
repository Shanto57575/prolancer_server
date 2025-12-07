import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync";
import { AppError } from "../../utils/AppError";
import { applicationService } from "./application.service";
import { sendResponse } from "../../utils/sendResponse";

const createApplication = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { jobId } = req.body;

  if (!userId) throw new AppError(401, "Unauthorized Access");
  if (!jobId) throw new AppError(400, "Job ID is required");

  const result = await applicationService.createApplication({ userId, jobId });
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Application submitted successfully",
    data: result,
  });
});

const getMyApplications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "Unauthorized");

  const filters = { ...req.query };
  const excludeFields = ["page", "limit", "sortBy", "sortOrder"];
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  excludeFields.forEach((field) => delete filters[field]);

  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    sortBy: (req.query.sortBy as string) || "createdAt",
    sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
    filters,
  };

  const result = await applicationService.getMyApplications(userId, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Applications fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getJobApplications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const jobId = req.params.jobId;

  if (!userId) throw new AppError(401, "Unauthorized");

  const filters = { ...req.query };
  const excludeFields = ["page", "limit", "sortBy", "sortOrder"];
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  excludeFields.forEach((field) => delete filters[field]);

  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    sortBy: (req.query.sortBy as string) || "createdAt",
    sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
    filters,
  };

  const result = await applicationService.getApplicationsByJobId(
    jobId as string,
    userId,
    options
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Job applications fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateApplicationStatus = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const applicationId = req.params.id;
    const { status } = req.body;

    if (!userId) throw new AppError(401, "Unauthorized");

    const result = await applicationService.updateApplicationStatus(
      applicationId as string,
      status,
      userId
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Application status updated successfully",
      data: result,
    });
  }
);

export const applicationController = {
  createApplication,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
};
