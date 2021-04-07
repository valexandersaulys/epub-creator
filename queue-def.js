const Queue = require("bull");

const epubQueue = new Queue(
  "epub processing",
  process.env.REDIS_URL || "redis://127.0.0.1:6379"
);

module.exports = { epubQueue };
