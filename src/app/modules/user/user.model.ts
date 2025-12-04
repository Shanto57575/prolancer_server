import { Schema, model } from "mongoose";
import { Provider, UserRole } from "../../constants/enums";
import { IAuthProvider, IUser } from "./user.interface";

const AuthProviderSchema = new Schema<IAuthProvider>(
  {
    provider: {
      type: String,
      enum: Object.values(Provider),
      default: Provider.CREDENTIAL,
    },
    providerId: { type: String, required: true },
  },
  { _id: false, timestamps: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    profilePicture: { type: String },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CLIENT,
    },
    //for simplicity keeping all users verified later will implement email/otp verification
    isVerified: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    authProviders: {
      type: [AuthProviderSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const User = model<IUser>("User", UserSchema);

export default User;
