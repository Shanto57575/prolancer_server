/* eslint-disable @typescript-eslint/no-explicit-any */
import { isValidObjectId } from "mongoose";
import modelQuery from "../../utils/modelQuery";
import { AppError } from "../../utils/AppError";
import Freelancer from "./freelancer.model";
import User from "../user/user.model";
import { checkFreelancerProfileComplete } from "../../utils/profileCompletion";

const getByUserId = async (userId: string) => {
  if (!isValidObjectId(userId)) throw new AppError(400, "Invalid user id");

  const profile = await Freelancer.findOne({ userId }).populate({
    path: "userId",
    select: "name email profilePicture role",
    model: User,
  });

  if (!profile) throw new AppError(404, "user not found");
  return profile;
};

const updateByUserId = async (userId: string, payload: Record<string, any>) => {
  if (!isValidObjectId(userId)) throw new AppError(400, "Invalid user id");

  const profile = await Freelancer.findOneAndUpdate({ userId }, payload, {
    new: true,
    runValidators: true,
  }).populate({
    path: "userId",
    select: "name email profilePicture role",
    model: User,
  });

  if (!profile) throw new AppError(404, "Freelancer profile not found");

  const isComplete = checkFreelancerProfileComplete(profile);
  if (profile.isProfileComplete !== isComplete) {
    profile.isProfileComplete = isComplete;
    await profile.save();
  }

  return profile;
};

const getById = async (id: string) => {
  if (!isValidObjectId(id)) throw new AppError(400, "Invalid id");
  const profile = await Freelancer.findById(id).populate({
    path: "userId",
    select: "name email profilePicture role",
    model: User,
  });
  if (!profile) throw new AppError(404, "Freelancer not found");
  return profile;
};

const getAll = async (options: any) => {
  return modelQuery(Freelancer, {
    page: options.page,
    limit: options.limit,
    sortBy: options.sortBy,
    sortOrder: options.sortOrder,
    search: options.search,
    searchableFields: ["bio", "skills", "designation", "location"],
    filters: {
      skill: options.filters?.skill,
      location: options.filters?.location,
      min_hourlyRate: options.filters?.minRate,
      max_hourlyRate: options.filters?.maxRate,
    },
  });
};

export const freelancerService = {
  getByUserId,
  updateByUserId,
  getById,
  getAll,
};
