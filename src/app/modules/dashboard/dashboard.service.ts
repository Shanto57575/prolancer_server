import User from "../user/user.model";
import Job from "../job/job.model";
import { Application } from "../application/application.model";
import Freelancer from "../freelancer/freelancer.model";
import { UserRole } from "../../constants/enums";
import { JobStatus } from "../job/job.constant";
import { ApplicationStatus } from "../application/application.interface";
import {
  IAdminDashboardStats,
  IClientDashboardStats,
  IFreelancerDashboardStats,
} from "./dashboard.interface";
import { AppError } from "../../utils/AppError";
import { Types } from "mongoose";

const getDashboardStats = async (
  userId: string,
  role: string
): Promise<
  IAdminDashboardStats | IClientDashboardStats | IFreelancerDashboardStats
> => {
  if (role === UserRole.ADMIN) {
    const totalUsers = await User.countDocuments();
    // Assuming 'active' means not banned and verified
    const activeUsers = await User.countDocuments({
      isBanned: false,
      isVerified: true,
    });
    const totalJobs = await Job.countDocuments({ isDeleted: false });
    const totalApplications = await Application.countDocuments();
    const totalFreelancers = await User.countDocuments({
      role: UserRole.FREELANCER,
    });
    const totalClients = await User.countDocuments({ role: UserRole.CLIENT });

    return {
      totalUsers,
      activeUsers,
      totalJobs,
      totalApplications,
      totalFreelancers,
      totalClients,
    };
  } else if (role === UserRole.CLIENT) {
    const totalJobsPosted = await Job.countDocuments({
      clientId: new Types.ObjectId(userId),
      isDeleted: false,
    });
    const activeJobs = await Job.countDocuments({
      clientId: new Types.ObjectId(userId),
      status: JobStatus.OPEN,
      isDeleted: false,
    });

    // We can aggregate applications for jobs posted by this client
    const clientJobs = await Job.find({
      clientId: new Types.ObjectId(userId),
    }).select("_id");
    const jobIds = clientJobs.map((job) => job._id);

    const totalApplicationsReceived = await Application.countDocuments({
      jobId: { $in: jobIds },
    });

    return {
      totalJobsPosted,
      activeJobs,
      totalApplicationsReceived,
    };
  } else if (role === UserRole.FREELANCER) {
    const freelancer = await Freelancer.findOne({ userId });

    if (!freelancer) {
      // If no freelancer profile exists, return zeros
      return {
        totalApplications: 0,
        acceptedApplications: 0,
        pendingApplications: 0,
        rejectedApplications: 0,
      };
    }

    const freelancerId = freelancer._id;

    const totalApplications = await Application.countDocuments({
      freelancerId,
    });
    const acceptedApplications = await Application.countDocuments({
      freelancerId,
      status: ApplicationStatus.ACCEPTED,
    });
    const pendingApplications = await Application.countDocuments({
      freelancerId,
      status: ApplicationStatus.PENDING,
    });
    const rejectedApplications = await Application.countDocuments({
      freelancerId,
      status: ApplicationStatus.REJECTED,
    });

    return {
      totalApplications,
      acceptedApplications,
      pendingApplications,
      rejectedApplications,
    };
  } else {
    throw new AppError(400, "Invalid user role");
  }
};

export const dashboardService = {
  getDashboardStats,
};
