import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync";
import { userService } from "./user.service";
import { envConfig } from "../../config/envConfig";
import { generateToken } from "../../utils/jwt";
import { setAuthCookie } from "../../utils/setCookie";
import { JwtPayload } from "jsonwebtoken";
import { AppError } from "../../utils/AppError";
import { sendResponse } from "../../utils/sendResponse";

const registerController = catchAsync(async (req: Request, res: Response) => {
  const registeredUser = await userService.registerService(req.body);

  const tokenPayload: JwtPayload = {
    id: registeredUser._id,
    email: registeredUser.email,
    role: registeredUser.role,
  };

  const accessToken = generateToken(
    tokenPayload,
    envConfig.ACCESS_TOKEN_SECRET,
    envConfig.ACCESS_TOKEN_EXPIRES
  );

  const refreshToken = generateToken(
    tokenPayload,
    envConfig.REFRESH_TOKEN_SECRET,
    envConfig.REFRESH_TOKEN_EXPIRES
  );

  setAuthCookie(res, { accessToken, refreshToken });

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    user: registeredUser,
  });
});

const getMyProfileController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "Unauthorized Access");

    const profile = await userService.getMyProfile(userId);
    console.log(profile);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile retrieved successfully",
      data: profile,
    });
  }
);

const updateMyProfileController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "Unauthorized");

    const { name, profilePicture } = req.body;
    const updatedUser = await userService.updateMyProfile(userId, {
      name,
      profilePicture,
    });

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  }
);

const getAllUsersController = catchAsync(
  async (req: Request, res: Response) => {
    const { page, limit, search, sortBy, sortOrder, role, isBanned } =
      req.query;

    const { data, meta } = await userService.getAllUsers({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as "asc" | "desc",
      role: role as string,
      isBanned: isBanned as string,
    });

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Users retrieved successfully",
      data,
      meta,
    });
  }
);

const banUserController = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    throw new AppError(400, "User ID is required");
  }

  const user = await userService.banUser(id);

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `User ${user.isBanned ? "banned" : "unbanned"} successfully`,
    data: user,
  });
});

export const userController = {
  registerController,
  getMyProfileController,
  updateMyProfileController,
  getAllUsersController,
  banUserController,
};
