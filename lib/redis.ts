import { createClient, RedisClientType } from "redis";

declare global {
  var redis: RedisClientType | undefined;
}

export const redis: RedisClientType =
  global.redis ??
  createClient({
    username: "default",
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
  });

if (!global.redis) {
  global.redis = redis;

  redis.on("error", (err) => {
    console.error("Redis Error:", err);
  });

  (async () => {
    if (!redis.isOpen) {
      await redis.connect();
      console.log("Redis connected");

      try {
        await redis.sendCommand(["CLIENT", "KILL", "TYPE", "normal"]);
        console.log("Old Redis clients cleared");
      } catch (err) {
        console.error("Failed to clear clients:", err);
      }
    }
  })();
}