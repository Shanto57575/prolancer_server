import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync";
import { userService } from "./user.service";
import { envConfig } from "../../config/envConfig";
import { generateToken } from "../../utils/jwt";
import { setAuthCookie } from "../../utils/setCookie";
import { JwtPayload } from "jsonwebtoken";

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
    message: "User created successfully",
    user: registeredUser,
  });
});

export const userController = {
  registerController,
};
