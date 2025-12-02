import { Response } from "express";
import { envConfig } from "../config/envConfig";

interface IAuthToken {
  accessToken: string;
  refreshToken: string;
}

export const setAuthCookie = (res: Response, tokens: IAuthToken) => {
  const isProd = envConfig.NODE_ENV === "production";

  res.cookie("accessToken", tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
