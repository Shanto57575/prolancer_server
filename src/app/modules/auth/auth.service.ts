import { AppError } from "../../utils/AppError";
import { IUser } from "../user/user.interface";
import User from "../user/user.model";
import bcrypt from "bcrypt";

const loginService = async (payload: IUser) => {
  const { email, password } = payload;

  if (!email || !password) {
    throw new AppError(400, "Email and password are required!");
  }

  const isUserExists = await User.findOne({ email }).select("+password");

  if (!isUserExists) {
    throw new AppError(400, "User does not exist!");
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    isUserExists.password as string
  );

  if (!isPasswordMatched) {
    throw new AppError(400, "Invalid credentials!");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...user } = isUserExists.toObject();

  return user;
};

export const authService = {
  loginService,
};
