const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.route");
const userRoutes = require("./user.route");
const connectionRoutes = require("./connection.routes");
const likeRoutes = require("./like.routes");
const notificationRoutes = require("./notification.routes");

// Register all routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/connections", connectionRoutes);
router.use("/likes", likeRoutes);
router.use("/notifications", notificationRoutes);

module.exports = router;
