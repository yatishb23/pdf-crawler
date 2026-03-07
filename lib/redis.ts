import { createClient, RedisClientType } from "redis";

declare global {
  var redisClient: RedisClientType | undefined;
  var redisConnectPromise: Promise<void> | undefined;
  var redisErrorListenerAttached: boolean | undefined;
}

const redisClient: RedisClientType =
  globalThis.redisClient ??
  createClient({
    username: "default",
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
  });

globalThis.redisClient = redisClient;

if (!globalThis.redisErrorListenerAttached) {
  redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
  });
  globalThis.redisErrorListenerAttached = true;
}

if (!redisClient.isOpen) {
  globalThis.redisConnectPromise ??= redisClient
    .connect()
    .then(() => undefined)
    .catch((err) => {
      console.error("Redis Connection Error:", err);
      throw err;
    })
    .finally(() => {
      globalThis.redisConnectPromise = undefined;
    });
}

export const redis: RedisClientType = redisClient;