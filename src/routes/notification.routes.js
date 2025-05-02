const express = require("express");
const router = express.Router();
const { notificationController } = require("../controllers");
const { userAuth } = require("../middlewares/auth");

router.get("/", userAuth, notificationController.getNotifications);
router.get("/unread-count", userAuth, notificationController.getUnreadCount);
router.post("/mark-read", userAuth, notificationController.markAsRead);

module.exports = router;
