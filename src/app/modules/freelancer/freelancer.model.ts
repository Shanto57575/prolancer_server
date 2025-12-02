import { model, Schema } from "mongoose";
import { IFreelancer } from "./freelancer.interface";

const freelancerSchema = new Schema<IFreelancer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    bio: String,
    skills: { type: [String], default: [] },
    portfolio: String,
    resume: String,
    hourlyRate: Number,
    experience: Number,
    rating: Number,
    location: String,
    designation: String,
  },
  { timestamps: true }
);

const Freelancer = model<IFreelancer>("Freelancer", freelancerSchema);

export default Freelancer;
