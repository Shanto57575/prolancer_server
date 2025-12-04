/* eslint-disable @typescript-eslint/no-explicit-any */
import { isValidObjectId } from "mongoose";
import { AppError } from "../../utils/AppError";
import Client from "./client.model";
import User from "../user/user.model";
import { checkClientProfileComplete } from "../../utils/profileCompletion";

const getByUserId = async (userId: string) => {
  if (!isValidObjectId(userId)) throw new AppError(400, "Invalid user id");
  const profile = await Client.findOne({ userId }).populate({
    path: "userId",
    select: "name email profilePicture",
    model: User,
  });
  if (!profile) throw new AppError(404, "Client profile not found");
  return profile;
};

const updateByUserId = async (userId: string, payload: Record<string, any>) => {
  if (!isValidObjectId(userId)) throw new AppError(400, "Invalid user id");

  const profile = await Client.findOneAndUpdate({ userId }, payload, {
    new: true,
    runValidators: true,
  }).populate({
    path: "userId",
    select: "name email profilePicture",
    model: User,
  });

  if (!profile) throw new AppError(404, "Client profile not found");

  // Check and update profile completion status
  const isComplete = checkClientProfileComplete(profile);
  if (profile.isProfileComplete !== isComplete) {
    profile.isProfileComplete = isComplete;
    await profile.save();
  }

  return profile;
};

export const clientService = {
  getByUserId,
  updateByUserId,
};
