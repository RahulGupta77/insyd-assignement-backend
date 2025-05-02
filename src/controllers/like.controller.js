const { Like } = require("../models/like.model");
const { User } = require("../models/user.model");
const notificationService = require("../services/notification.service");

/**
 * Like a user's profile
 */
const likeUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUser = req.user;

    if (userId === currentUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot like your own profile",
      });
    }

    // Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already liked
    const existingLike = await Like.findOne({
      fromUser: currentUser._id,
      toUser: userId,
    });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: "You already liked this user",
      });
    }

    // Create new like
    const like = new Like({
      fromUser: currentUser._id,
      toUser: userId,
    });

    await like.save();

    // Update user's likedBy array
    await User.findByIdAndUpdate(userId, {
      $addToSet: { likedBy: currentUser._id },
    });

    // Queue notification
    await notificationService.queueLikeNotification(
      currentUser._id,
      userId,
      currentUser.username
    );

    return res.status(201).json({
      success: true,
      message: "User liked successfully",
      like: {
        id: like._id,
        createdAt: like.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in likeUser:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Unlike a user's profile
 */
const unlikeUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUser = req.user;

    // Delete the like
    const result = await Like.findOneAndDelete({
      fromUser: currentUser._id,
      toUser: userId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Like not found",
      });
    }

    // Update user's likedBy array
    await User.findByIdAndUpdate(userId, {
      $pull: { likedBy: currentUser._id },
    });

    return res.status(200).json({
      success: true,
      message: "User unliked successfully",
    });
  } catch (error) {
    console.error("Error in unlikeUser:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  likeUser,
  unlikeUser,
};
