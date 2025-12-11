import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { dashboardService } from "./dashboard.service";

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await dashboardService.getDashboardStats(user.id, user.role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dashboard stats fetched successfully",
    data: result,
  });
});

export const dashboardController = {
  getDashboardStats,
};
