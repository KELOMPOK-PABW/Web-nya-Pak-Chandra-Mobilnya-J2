const env = require("./config/env");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const pinoHttp = require("pino-http");

const logger = require("./utils/logger");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { authenticate } = require("./middleware/authMiddleware");

const userRoutes = require("./routes/usersRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const walletRoutes = require("./routes/walletRoutes");
const productRoutes = require("./routes/productRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const authRoutes = require("./routes/authRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const chatRoutes = require("./routes/chatRoutes");
const llmRoutes = require("./routes/llmRoutes");
const authController = require("./controller/authController");
const reviewController = require("./controller/reviewController");

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet());

const corsOrigins = env.CORS_ORIGIN === "*"
  ? "*"
  : env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(
  pinoHttp({
    logger,
    customLogLevel: (req, res, err) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    serializers: {
      req: (req) => ({ method: req.method, url: req.url, id: req.id }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  })
);

const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Terlalu banyak request, coba lagi nanti." },
});

const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: "Terlalu banyak percobaan login, coba lagi nanti." },
});

app.use("/api/", globalLimiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", env: env.NODE_ENV, uptime: process.uptime() });
});

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/users", authenticate, userRoutes);
app.use("/api/cart", authenticate, cartRoutes);
app.use("/api/checkout", authenticate, checkoutRoutes);
app.use("/api/wallet", authenticate, walletRoutes);
app.use("/api/payments", authenticate, paymentRoutes);
app.use("/api/seller", authenticate, sellerRoutes);
app.use("/api/reviews", authenticate, reviewRoutes);
app.use("/api/chat", authenticate, chatRoutes);
app.use("/api/llm", authenticate, llmRoutes);
app.get("/api/my/reviews", authenticate, reviewController.getMyReviews);
app.get("/api/me", authenticate, authController.getMe);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT} (${env.NODE_ENV})`);
});

const shutdown = (signal) => {
  logger.info({ signal }, "shutting down");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "unhandledRejection");
});
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "uncaughtException");
  process.exit(1);
});

module.exports = app;
