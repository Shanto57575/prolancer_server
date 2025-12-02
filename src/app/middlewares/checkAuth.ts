import { Request, Response, NextFunction } from "express";
import User from "../modules/user/user.model";
import { AppError } from "../utils/AppError";
import { envConfig } from "../config/envConfig";
import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../utils/jwt";

export const checkAuth =
  (...allowedRoles: string[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) return next(new AppError(401, "Unauthorized Access"));

    const decoded = verifyToken(token, envConfig.ACCESS_TOKEN_SECRET);
    if (!decoded) return next(new AppError(401, "Invalid or expired token"));

    const user = await User.findById((decoded as JwtPayload).id);
    if (!user) return next(new AppError(401, "User not found"));

    if (!user.isVerified)
      return next(new AppError(401, "User is not verified"));

    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
      return next(new AppError(403, "Forbidden Access"));
    }

    req.user = user;
    next();
  };
