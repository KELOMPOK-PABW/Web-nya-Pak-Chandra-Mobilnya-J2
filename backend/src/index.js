require("dotenv").config({ path: "src/config/.env" });
require("dotenv").config();
const express = require("express");
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
const authController = require("./controller/authController")
const reviewController = require("./controller/reviewController")
const { authenticate } = require("./middleware/authMiddleware")

app.use(express.json());

// Public routes
app.use("/api/products", productRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/auth", authRoutes)

// Protected routes (require authentication)
app.use("/api/users", authenticate, userRoutes)
app.use("/api/cart", authenticate, cartRoutes)
app.use("/api/checkout", authenticate, checkoutRoutes)
app.use("/api/orders", authenticate, orderRoutes)
app.use("/api/wallet", authenticate, walletRoutes)
app.use("/api/payments", authenticate, paymentRoutes)
app.use("/api/seller", authenticate, sellerRoutes)
app.use("/api/reviews", authenticate, reviewRoutes)
app.use("/api/chat", authenticate, chatRoutes)
app.use("/api/llm", authenticate, llmRoutes)
app.get("/api/my/reviews", authenticate, reviewController.getMyReviews)
app.get("/api/me", authenticate, authController.getMe)

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});