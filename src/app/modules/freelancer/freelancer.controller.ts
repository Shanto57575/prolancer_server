import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { freelancerService } from "./freelancer.service";
import { AppError } from "../../utils/AppError";

const getMyFreelancerProfile = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "Unauthorized Access");

    const profile = await freelancerService.getByUserId(userId);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "user profile retrieved",
      data: profile,
    });
  }
);

const updateFreelancerProfile = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "Unauthorized");

    const allowed = [
      "bio",
      "skills",
      "portfolio",
      "resume",
      "hourlyRate",
      "experience",
      "designation",
      "location",
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = {};
    for (const field of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        payload[field] = req.body[field];
      }
    }

    const updated = await freelancerService.updateByUserId(userId, payload);
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "freelancer profile updated",
      data: updated,
    });
  }
);

const getFreelancerById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const profile = await freelancerService.getById(id as string);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "user profile retrieved",
    data: profile,
  });
});

const getAllFreelancers = catchAsync(async (req: Request, res: Response) => {
  const {
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    skill,
    location,
    minRate,
    maxRate,
  } = req.query;

  const queryOptions = {
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    sortBy: (sortBy as string) || "createdAt",
    sortOrder: (sortOrder as string) || "desc",
    search: (search as string) || undefined,
    filters: {
      skill: skill as string | undefined,
      location: location as string | undefined,
      minRate: minRate !== undefined ? Number(minRate) : undefined,
      maxRate: maxRate !== undefined ? Number(maxRate) : undefined,
    },
  };

  const result = await freelancerService.getAll(queryOptions);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "freelancers list retrieved",
    meta: result.meta,
    data: result.data,
  });
});

export const freelancerController = {
  getMyFreelancerProfile,
  updateFreelancerProfile,
  getFreelancerById,
  getAllFreelancers,
};
