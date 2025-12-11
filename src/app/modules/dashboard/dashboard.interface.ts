export interface IAdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalFreelancers: number;
  totalClients: number;
}

export interface IClientDashboardStats {
  totalJobsPosted: number;
  activeJobs: number;
  totalApplicationsReceived: number;
  // This could be calculated from accepted applications * budget, but keeping it simple for now
  totalSpent?: number;
}

export interface IFreelancerDashboardStats {
  totalApplications: number;
  acceptedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
  // Similar to client, could be calculated
  totalEarnings?: number;
}

export type IDashboardStats =
  | IAdminDashboardStats
  | IClientDashboardStats
  | IFreelancerDashboardStats;
