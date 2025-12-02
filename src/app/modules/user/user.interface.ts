import { Document } from "mongoose";

export interface IAuthProvider {
  provider: string;
  providerId: string;
  isVerified: boolean;
}

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  role: string;
  isVerified: boolean;
  authProviders: IAuthProvider[];
  profilePicture?: string;
}
