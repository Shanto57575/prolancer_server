import { model, Schema } from "mongoose";
import { Availability, IFreelancer } from "./freelancer.interface";

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
    otherWebsiteLink: String,
    linkedinLink: String,
    hourlyRate: { type: Number, default: 0, min: 0 },
    experience: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    location: String,
    designation: String,
    languages: { type: [String], default: [] },
    education: { type: [String], default: [] },
    availability: {
      type: String,
      enum: Availability,
      default: Availability.Hourly,
    },
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Freelancer = model<IFreelancer>("Freelancer", freelancerSchema);

export default Freelancer;
