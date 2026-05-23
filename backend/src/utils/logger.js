const pino = require("pino");
const env = require("../config/env");

const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: "pabw-backend", env: env.NODE_ENV },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.token",
      "*.access_token",
    ],
    censor: "[REDACTED]",
  },
  transport: env.isProd
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:standard", ignore: "pid,hostname" },
      },
});

module.exports = logger;
