import { envConfig } from "./envConfig";
import { createClient } from "redis";

export const redisClient = createClient({
  username: envConfig.REDIS_USERNAME,
  password: envConfig.REDIS_PASSWORD,
  socket: {
    host: envConfig.REDIS_HOST,
    port: Number(envConfig.REDIS_PORT),
  },
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis Connected!");
  }
};
