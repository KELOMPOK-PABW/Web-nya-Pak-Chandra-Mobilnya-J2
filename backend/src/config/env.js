require("dotenv").config({ path: "src/config/.env" });
require("dotenv").config();

const REQUIRED = ["DATABASE_URL", "JWT_SECRET"];
const OPTIONAL_WITH_DEFAULTS = {
  NODE_ENV: "development",
  PORT: "3000",
  CORS_ORIGIN: "*",
  LOG_LEVEL: "info",
  RATE_LIMIT_WINDOW_MS: "60000",
  RATE_LIMIT_MAX: "120",
  AUTH_RATE_LIMIT_MAX: "10",
  JWT_EXPIRES_IN: "1d",
  BCRYPT_SALT_ROUNDS: "12",
};

const missing = REQUIRED.filter((k) => !process.env[k] || process.env[k].trim() === "");
if (missing.length > 0) {
  console.error(
    `[FATAL] Missing required env vars: ${missing.join(", ")}. ` +
      `Create backend/.env from .env.example and set these values.`
  );
  process.exit(1);
}

for (const [k, v] of Object.entries(OPTIONAL_WITH_DEFAULTS)) {
  if (process.env[k] === undefined || process.env[k] === "") {
    process.env[k] = v;
  }
}

if (
  process.env.NODE_ENV === "production" &&
  (process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET === "supersecretkey")
) {
  console.error(
    "[FATAL] JWT_SECRET must be at least 32 chars and not the default placeholder in production."
  );
  process.exit(1);
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  isProd: process.env.NODE_ENV === "production",
  PORT: parseInt(process.env.PORT, 10),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  LOG_LEVEL: process.env.LOG_LEVEL,
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10),
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
};
