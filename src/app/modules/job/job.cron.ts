import cron from "node-cron";
import Job from "./job.model";
import { JobStatus } from "./job.constant";

export const initJobCron = () => {
  // Run every hour
  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();
      const result = await Job.updateMany(
        {
          deadline: { $lt: now },
          status: JobStatus.OPEN,
          isDeleted: false,
        },
        {
          status: JobStatus.CLOSED,
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`Cron: Closed ${result.modifiedCount} expired jobs.`);
      }
    } catch (error) {
      console.error("Cron: Error auto-closing jobs", error);
    }
  });

  console.log("Job Cron initialized");
};
