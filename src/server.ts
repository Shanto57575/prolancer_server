import app from "./app";
import { Server } from "http";
import mongoose from "mongoose";
import { envConfig } from "./app/config/envConfig";
import { initJobCron } from "./app/modules/job/job.cron";
import { connectRedis } from "./app/config/redis.config";

let server: Server;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(envConfig.DATABASE_URL);
    console.log("📦 Connected to database !!!", conn.connection.host);
  } catch (err) {
    console.error("DB connection failed:", err);
    process.exit(1);
  }
};

const startServer = async () => {
  await connectDB();

  initJobCron();

  server = app.listen(envConfig.PORT, () => {
    console.log(`🚀 Server running on port ${envConfig.PORT}`);
  });
};

(async()=>{
  await startServer();
  await connectRedis()
})()

const shutdown = async (reason: string) => {
  console.log("🔻 Shutting down:", reason);

  try {
    if (server) {
      server.close(() => console.log("🛑 HTTP server closed"));
    }

    await mongoose.connection.close();
    console.log("🗃️ Mongoose disconnected");

    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  shutdown("uncaughtException");
});
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  shutdown("unhandledRejection");
});
