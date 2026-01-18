import { AppError } from "../../utils/AppError";
import { IUser } from "../user/user.interface";
import User from "../user/user.model";
import bcrypt from "bcrypt";
import { verifyToken, generateToken } from "../../utils/jwt";
import { envConfig } from "../../config/envConfig";
import { JwtPayload } from "jsonwebtoken";

const loginService = async (payload: IUser) => {
  const { email, password } = payload;

  if (!email || !password) {
    throw new AppError(400, "Email and password are required!");
  }

  const isUserExists = await User.findOne({ email }).select("+password");

  if (!isUserExists) {
    throw new AppError(400, "User does not exist!");
  }

  if (!isUserExists.isVerified) {
    throw new AppError(400, "Please verify your email before logging in!");
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    isUserExists.password as string
  );

  if (!isPasswordMatched) {
    throw new AppError(400, "Invalid credentials!");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...user } = isUserExists.toObject();

  return user;
};

const refreshTokenService = async (token: string) => {
  if (!token) {
    throw new AppError(400, "Refresh token is required!");
  }

  let decoded;
  try {
    decoded = verifyToken(token, envConfig.REFRESH_TOKEN_SECRET as string);
  } catch (err) {
    console.log(err);
    throw new AppError(401, "Invalid or expired refresh token!");
  }

  const { email } = decoded as JwtPayload;

  const isUserExists = await User.findOne({ email });

  if (!isUserExists) {
    throw new AppError(404, "User does not exist!");
  }

  const tokenPayload: JwtPayload = {
    id: isUserExists._id,
    email: isUserExists.email,
    role: isUserExists.role,
  };

  const accessToken = generateToken(
    tokenPayload,
    envConfig.ACCESS_TOKEN_SECRET,
    envConfig.ACCESS_TOKEN_EXPIRES
  );

  return {
    accessToken,
  };
};

export const authService = {
  loginService,
  refreshTokenService,
};
