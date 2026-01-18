import crypto from "crypto";
import { sendEmail } from "../../utils/sendEmail";
import User from "../user/user.model";
import { AppError } from "../../utils/AppError";
import { redisClient } from "../../config/redis.config";

const OTP_EXPIRATION = 2 * 60;

const generateOtp = (length = 6) => {
  const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
  return otp;
};

const sendOTPService = async (email: string, name: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(404, "User Not Found");
  }

  if (user.isVerified) {
    throw new AppError(409, "You Are already Verified");
  }

  const displayName = (name && name.trim()) || user.name || "User";

  const otp = generateOtp();

  const redisKey = `otp:${email}`;

  await redisClient.set(redisKey, otp, {
    expiration: {
      type: "EX",
      value: OTP_EXPIRATION,
    },
  });

  await sendEmail({
    to: email,
    subject: "Verify your Prolancer Account - OTP Code",
    templateName: "otp",
    templateData: {
      name: displayName,
      otp: otp,
    },
  });
};

const verifyOTPService = async (email: string, otp: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(404, "User Not Found");
  }

  if (user.isVerified) {
    throw new AppError(409, "You Are already Verified");
  }

  const redisKey = `otp:${email}`;
  const savedOtp = await redisClient.get(redisKey);
  if (!savedOtp) {
    throw new AppError(401, "Invalid OTP");
  }
  if (savedOtp !== otp) {
    throw new AppError(401, "Invalid OTP");
  }

  await Promise.all([
    User.updateOne({ email }, { isVerified: true }, { runValidators: true }),
    redisClient.del([redisKey]),
  ]);

  const verifiedUser = await User.findOne({ email });
  return verifiedUser;
};

export const otpService = {
  sendOTPService,
  verifyOTPService,
};
