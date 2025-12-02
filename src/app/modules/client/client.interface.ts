import { Document, Types } from "mongoose";

export interface IClient extends Document {
  userId: Types.ObjectId;
  company?: string;
  website?: string;
  bio?: string;
  location?: string;
  experience?: number;
  rating?: number;
  designation?: string;
}
