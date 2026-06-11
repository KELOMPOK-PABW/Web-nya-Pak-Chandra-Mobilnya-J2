const env = require("./config/env");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const pinoHttp = require("pino-http");

const logger = require("./utils/logger");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

const userRoutes = require("./routes/usersRoutes")
const cartRoutes = require("./routes/cartRoutes")
const checkoutRoutes = require("./routes/checkoutRoutes")
const orderRoutes = require("./routes/orderRoutes")
const walletRoutes = require("./routes/walletRoutes")
const productRoutes = require("./routes/productRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const authRoutes = require("./routes/authRoutes")
const sellerRoutes = require("./routes/sellerRoutes")
const categoryRoutes = require("./routes/categoryRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const chatRoutes = require("./routes/chatRoutes")
const llmRoutes = require("./routes/llmRoutes")
const courierRoutes = require("./routes/courierRoutes")
const adminRoutes = require("./routes/adminRoutes")
const addressRoutes = require("./routes/addressRoutes")
const authController = require("./controller/authController")
const reviewController = require("./controller/reviewController")
const storeController = require("./controller/storeController")
const { authenticate } = require("./middleware/authMiddleware")

// Middleware
app.use(cors({
  origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN,
  credentials: true,
}));
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for Tailwind inline styles
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    message: { success: false, message: "Terlalu banyak permintaan, coba lagi nanti" },
  })
);
app.use(pinoHttp({ logger }));
app.use(express.json());

// Public routes
app.use("/api/products", productRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/auth", authRoutes)

// Protected routes (require authentication)
app.use("/api/users", authenticate, userRoutes)
app.use("/api/cart", authenticate, cartRoutes)
app.use("/api/addresses", authenticate, addressRoutes)
app.use("/api/checkout", authenticate, checkoutRoutes)
app.use("/api/orders", authenticate, orderRoutes)
app.use("/api/wallet", authenticate, walletRoutes)
app.use("/api/payments", authenticate, paymentRoutes)
app.use("/api/seller", authenticate, sellerRoutes)
app.use("/api/reviews", authenticate, reviewRoutes)
app.use("/api/chat", authenticate, chatRoutes)
app.use("/api/llm", authenticate, llmRoutes)
app.use("/api/courier", authenticate, courierRoutes)
app.use("/api/admin", authenticate, adminRoutes)
app.get("/api/stores/me", authenticate, storeController.getMyStore)
app.put("/api/stores/me", authenticate, storeController.updateMyStore)
app.get("/api/my/reviews", authenticate, reviewController.getMyReviews)
app.get("/api/me", authenticate, authController.getMe)
app.put("/api/me", authenticate, authController.updateMe)

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
