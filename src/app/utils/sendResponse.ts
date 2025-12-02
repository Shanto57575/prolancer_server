import { Response } from "express";

export interface ISendResponse<T> {
  statusCode: number;
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export const sendResponse = <T>(
  res: Response,
  payload: ISendResponse<T>
): void => {
  const { statusCode, success, message, data, meta } = payload;

  res.status(statusCode).json({
    success,
    message,
    data,
    meta,
  });
};
