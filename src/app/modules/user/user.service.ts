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

export const userService = {
  registerService,
  getMyProfile,
  updateMyProfile,
};
