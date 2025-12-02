import { Schema, model } from "mongoose";
import { IClient } from "./client.interface";

const clientSchema = new Schema<IClient>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    company: String,
    website: String,
    bio: String,
    location: String,
    experience: Number,
    rating: Number,
    designation: String,
  },
  { timestamps: true }
);

const Client = model<IClient>("Client", clientSchema);

export default Client;
