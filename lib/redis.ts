import { createClient } from "redis";

const globalForRedis = global as unknown as {
  redis: ReturnType<typeof createClient> | undefined;
};

export const redis =
  globalForRedis.redis ??
  createClient({
    username: "default",
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  });

if (!globalForRedis.redis) {
  globalForRedis.redis = redis;
  redis.connect().catch(console.error);
}

redis.on("error", (err) => {
  console.error("Redis Error:", err);
});
