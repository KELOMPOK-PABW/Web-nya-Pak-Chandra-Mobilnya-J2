require("dotenv").config({ path: "src/config/.env" });
const express = require("express");
const app = express();

const userRoutes = require("./routes/usersRoutes")
const cartRoutes = require("./routes/cartRoutes")
const checkoutRoutes = require("./routes/checkoutRoutes")
const walletRoutes = require("./routes/walletRoutes")

app.use(express.json());

app.use("/api/users",userRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/checkout", checkoutRoutes)
app.use("/api/wallet", walletRoutes)

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT }`);
});