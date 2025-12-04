import mongoose from "mongoose";
import { envConfig } from "../../config/envConfig";
import { Provider, UserRole } from "../../constants/enums";
import { AppError } from "../../utils/AppError";
import Client from "../client/client.model";
import Freelancer from "../freelancer/freelancer.model";
import { IUser } from "./user.interface";
import User from "./user.model";
import bcrypt from "bcrypt";

const registerService = async (payload: IUser) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, password } = payload;
    const isUserExists = await User.findOne({ email });

    if (isUserExists) {
      throw new AppError(400, "User already exists! please login");
    }

    const hashedPassword = await bcrypt.hash(
      password as string,
      Number(envConfig.BCRYPT_SALT_ROUNDS)
    );

    const authProvider = {
      provider: Provider.CREDENTIAL,
      providerId: email,
    };

    const user = await User.create(
      [
        {
          ...payload,
          password: hashedPassword,
          authProviders: [authProvider],
        },
      ],
      { session }
    );

    const userDoc = user[0];

    if (!userDoc) {
      throw new AppError(400, "User not found!");
    }

    if (userDoc.role === UserRole.FREELANCER) {
      await Freelancer.create(
        [
          {
            userId: userDoc._id,
          },
        ],
        { session }
      );
    }

    if (userDoc.role === UserRole.CLIENT) {
      await Client.create(
        [
          {
            userId: userDoc._id,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return userDoc;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log("error from registerService", error);
    throw error;
  }
};

const getMyProfile = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  let roleData = null;
  if (user.role === UserRole.FREELANCER) {
    roleData = await Freelancer.findOne({ userId: user._id });
  } else if (user.role === UserRole.CLIENT) {
    roleData = await Client.findOne({ userId: user._id });
  }

  return {
    ...user.toObject(),
    roleData,
  };
};

const updateMyProfile = async (
  userId: string,
  payload: { name?: string; profilePicture?: string }
) => {
  const allowedFields = ["name", "profilePicture"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      updateData[field] = payload[field as keyof typeof payload];
    }
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const getAllUsers = async (options: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  role?: string;
  isBanned?: string;
}) => {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 20;
  const skip = (page - 1) * limit;

  const sort: Record<string, 1 | -1> = {};
  const sortField = options.sortBy || "createdAt";
  sort[sortField] = options.sortOrder === "asc" ? 1 : -1;

  const matchConditions: any[] = [];

  // Filter by role
  if (options.role && options.role !== "ALL") {
    matchConditions.push({ role: options.role });
  }

  // Filter by banned status
  if (options.isBanned !== undefined && options.isBanned !== "") {
    matchConditions.push({ isBanned: options.isBanned === "true" });
  }

  // Search functionality
  if (options.search) {
    const searchRegex = new RegExp(options.search, "i");
    matchConditions.push({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { "clientData.location": searchRegex },
        { "clientData.designation": searchRegex },
        { "freelancerData.location": searchRegex },
        { "freelancerData.designation": searchRegex },
      ],
    });
  }

  const matchStage =
    matchConditions.length > 0
      ? { $match: { $and: matchConditions } }
      : { $match: {} };

  const pipeline: any[] = [
    {
      $lookup: {
        from: "clients",
        localField: "_id",
        foreignField: "userId",
        as: "clientData",
      },
    },
    {
      $lookup: {
        from: "freelancers",
        localField: "_id",
        foreignField: "userId",
        as: "freelancerData",
      },
    },
    {
      $addFields: {
        clientData: { $arrayElemAt: ["$clientData", 0] },
        freelancerData: { $arrayElemAt: ["$freelancerData", 0] },
      },
    },
    matchStage,
    { $sort: sort },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        metadata: [{ $count: "total" }],
      },
    },
  ];

  const result = await User.aggregate(pipeline);

  const data = result[0]?.data || [];
  const total = result[0]?.metadata[0]?.total || 0;

  const meta = {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };

  return { data, meta };
};

const banUser = async (userId: string) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError(400, "Invalid user id");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  user.isBanned = !user.isBanned;
  await user.save();

  return user;
};

export const userService = {
  registerService,
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  banUser,
};
