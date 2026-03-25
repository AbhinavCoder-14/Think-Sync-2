// Backend/src/redis/client.ts
import { Redis } from "ioredis";
import dotenv from "dotenv";
dotenv.config();

export const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
});

redis.on("connect", () => {
  console.log("Redis connected on", process.env.REDIS_HOST || "localhost");
});

redis.on("error", (err) => {
  console.log("Redis error", err);
});