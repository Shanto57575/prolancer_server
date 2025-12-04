import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync";
import { AppError } from "../../utils/AppError";
import { clientService } from "./client.service";
import { sendResponse } from "../../utils/sendResponse";

const getMyClientProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "Unauthorized");

  const profile = await clientService.getByUserId(userId);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Client profile fetched",
    data: profile,
  });
});

const updateClientProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "Unauthorized");

  const allowed = [
    "company",
    "website",
    "bio",
    "location",
    "designation",
    "experience",
  ];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: Record<string, any> = {};
  for (const field of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, field))
      payload[field] = req.body[field];
  }

  const updated = await clientService.updateByUserId(userId, payload);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Client profile updated",
    data: updated,
  });
});

export const clientController = {
  getMyClientProfile,
  updateClientProfile,
};
