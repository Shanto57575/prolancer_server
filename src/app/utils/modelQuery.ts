/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model, isValidObjectId } from "mongoose";

interface IQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  filters?: Record<string, any>;
  searchableFields?: string[];
  projection?: any;
  populate?: any;
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const modelQuery = async <T = any>(model: Model<T>, options: IQueryOptions) => {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 20;
  const skip = (page - 1) * limit;

  const sort: Record<string, 1 | -1> = {};
  const sortField = options.sortBy || "createdAt";
  sort[sortField] = options.sortOrder === "asc" ? 1 : -1;

  const andConditions = [];

  if (options.filters) {
    for (const [key, value] of Object.entries(options.filters)) {
      if (value === undefined || value === null || value === "") continue;

      if (key.startsWith("min_")) {
        const field = key.replace("min_", "");
        andConditions.push({ [field]: { $gte: Number(value) } } as any);
      } else if (key.startsWith("max_")) {
        const field = key.replace("max_", "");
        andConditions.push({ [field]: { $lte: Number(value) } } as any);
      } else {
        if (typeof value === "string") {
          if (isValidObjectId(value)) {
            andConditions.push({ [key]: value } as any);
          } else {
            andConditions.push({
              [key]: { $regex: escapeRegExp(value), $options: "i" },
            } as any);
          }
        } else {
          andConditions.push({ [key]: value } as any);
        }
      }
    }
  }

  if (options.search && options.searchableFields?.length) {
    const regex = new RegExp(escapeRegExp(options.search), "i");
    const orConditions = options.searchableFields.map((field) => ({
      [field]: regex,
    }));
    andConditions.push({ $or: orConditions });
  }

  const finalFilter = andConditions.length ? { $and: andConditions } : {};

  let query = model
    .find(finalFilter, options.projection || null)
    .skip(skip)
    .limit(limit)
    .sort(sort);

  if (options.populate) {
    if (Array.isArray(options.populate)) {
      options.populate.forEach((pop) => {
        query = query.populate(pop as any);
      });
    } else {
      query = query.populate(options.populate as any);
    }
  }

  const [data, total] = await Promise.all([
    query.lean(),
    model.countDocuments(finalFilter),
  ]);

  const meta = {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };

  return { data, meta };
};

export default modelQuery;
