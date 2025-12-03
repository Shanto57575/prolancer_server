import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { generateToken } from "../../utils/jwt";
import { envConfig } from "../../config/envConfig";
import { setAuthCookie } from "../../utils/setCookie";
import { authService } from "./auth.service";

const loginController = catchAsync(async (req: Request, res: Response) => {
  const loggedInUser = await authService.loginService(req.body);

  const tokenPayload: JwtPayload = {
    id: loggedInUser._id,
    email: loggedInUser.email,
    role: loggedInUser.role,
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
    message: "User Logged in successfully",
    user: loggedInUser,
    token: accessToken,
  });
});

const refreshTokenController = catchAsync(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    const result = await authService.refreshTokenService(refreshToken);

    setAuthCookie(res, {
      accessToken: result.accessToken,
      refreshToken,
    });

    res.status(200).json({
      success: true,
      message: "Access token retrieved successfully!",
      data: result,
    });
  }
);

export const authController = {
  loginController,
  refreshTokenController,
};
