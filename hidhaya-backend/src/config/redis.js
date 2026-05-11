const redis = require("redis");

const client = redis.createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379"
});

let redisErrorLogged = false;

client.on("error", (err) => {
  if (!redisErrorLogged) {
    console.log("Redis not available - caching disabled");
    redisErrorLogged = true;
  }
});

client.on("connect", () => {
  console.log("Redis Connected");
});

const connectRedis = async () => {
  console.log("connectRedis: Starting");
  try {
    console.log("connectRedis: Checking isOpen...");
    const isOpen = client.isOpen;
    console.log("connectRedis: isOpen =", isOpen);
    if (!isOpen) {
      console.log("connectRedis: About to connect... timeout=3s");
      const connectPromise = client.connect();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Redis connect timeout")), 3000)
      );
      await Promise.race([connectPromise, timeoutPromise]);
      console.log("connectRedis: Connected!");
    }
  } catch (err) {
    console.log("connectRedis: Error caught:", err.message);
    if (!redisErrorLogged) {
      console.log("Redis not available - caching disabled");
      redisErrorLogged = true;
    }
  }
  console.log("connectRedis: About to return");
};

module.exports = { client, connectRedis };
