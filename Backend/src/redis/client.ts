// Backend/src/redis/client.ts
import { Redis } from "ioredis";
import dotenv from "dotenv";
import { logger } from "../logger.js";
dotenv.config();

export const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
});

redis.on("connect", () => {
  logger.info({ redisHost: process.env.REDIS_HOST || "localhost" }, "redis connected");
});

redis.on("error", (err) => {
  logger.error({ err }, "redis error");
});