import { createClient, RedisClientType } from "redis";

declare global {
  var redis: RedisClientType | undefined;
  var redisConnecting: Promise<RedisClientType> | undefined;
}

const redisClient: RedisClientType =
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
  global.redis = redisClient;

  redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
  });
}

export const redis = async (): Promise<RedisClientType> => {
  if (redisClient.isOpen) return redisClient;

  if (!global.redisConnecting) {
    global.redisConnecting = redisClient.connect().then(() => redisClient);
  }

  return global.redisConnecting;
};