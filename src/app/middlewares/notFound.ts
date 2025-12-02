import { AppError } from "../utils/AppError";
import { Request, Response, NextFunction } from "express";

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(404, `Route not found: ${req.originalUrl}`));
};
