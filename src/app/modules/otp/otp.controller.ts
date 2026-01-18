/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { otpService } from "./otp.service";
import { catchAsync } from "../../middlewares/catchAsync";
import { generateToken } from "../../utils/jwt";
import { envConfig } from "../../config/envConfig";
import { setAuthCookie } from "../../utils/setCookie";
import { JwtPayload } from "jsonwebtoken";

const sendOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, name } = req.body;
  await otpService.sendOTPService(email, name);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "OTP Sent Successfully!",
    data: null,
  });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const verifiedUser = await otpService.verifyOTPService(email, otp);

  const tokenPayload: JwtPayload = {
    id: verifiedUser!._id,
    email: verifiedUser!.email,
    role: verifiedUser!.role,
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

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Email verified successfully!",
    data: {
      user: verifiedUser,
      accessToken,
    },
  });
});

export const OTPController = {
  sendOtp,
  verifyOtp,
};
