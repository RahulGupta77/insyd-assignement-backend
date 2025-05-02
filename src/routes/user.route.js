const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");
const { userAuth } = require("../middlewares/auth");

// Authenticated user info
router.get("/me", userAuth, userController.getCurrentUser);

// User Info
router.get("/", userAuth, userController.getAllUsers); // ?search=
router.get("/profile/:id", userAuth, userController.getUserById);
router.get("/queue", userAuth, userController.getUserQueue);

// Likes
router.get("/likes/sent", userAuth, userController.getUsersILiked);
router.get("/likes/received", userAuth, userController.getUsersWhoLikedMe);

// Broadcast
router.post("/broadcast", userAuth, userController.broadcastMessage);
router.get("/broadcast", userAuth, userController.getBroadcastMessages);

// Profile update
router.patch("/me", userAuth, userController.updateProfile);

module.exports = router;
