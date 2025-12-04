import { catchAsync } from "../../middlewares/catchAsync";
import modelQuery from "../../utils/modelQuery";
import { sendResponse } from "../../utils/sendResponse";
import Service from "./service.model";
import { Request, Response } from "express";

const createService = catchAsync(async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const service = await Service.create({ name, description });
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Service created successfully",
    data: service,
  });
});

const getAllService = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, search, sortBy, sortOrder, ...filters } = req.query;

  const { data, meta } = await modelQuery(Service, {
    page: Number(page),
    limit: Number(limit),
    search: search as string,
    searchableFields: ["name", "description"],
    sortBy: sortBy as string,
    sortOrder: sortOrder as "asc" | "desc",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filters: filters as Record<string, any>,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All services retrieved successfully",
    data,
    meta,
  });
});

const getServiceById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const service = await Service.findById(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service retrieved successfully",
    data: service,
  });
});

const updateService = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const service = await Service.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service updated successfully",
    data: service,
  });
});

const deleteService = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const service = await Service.findByIdAndDelete(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service deleted successfully",
    data: service,
  });
});

export const serviceController = {
  createService,
  getAllService,
  getServiceById,
  updateService,
  deleteService,
};
