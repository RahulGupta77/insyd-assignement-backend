const { User } = require("../models/user.model");
const { Connection } = require("../models/connection.model");
const { Like } = require("../models/like.model");
const { BroadcastMessage } = require("../models/broadcastMessage.model");
const notificationController = require("./notification.controller");
const notificationService = require("../services/notification.service");
const {
  NotificationTemplate,
} = require("../models/notificationTemplate.model");
/**
 * Get current authenticated user
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    // Get unread notification count
    const unreadCount = await notificationService.getUnreadCount(user._id);

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        profile: user.profile,
        unreadNotifications: unreadCount,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get all users with optional search filter
 */
const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const currentUserId = req.user._id;

    let query = { _id: { $ne: currentUserId } };

    // Add search filter if provided
    if (search) {
      query.username = { $regex: search, $options: "i" };
    }

    const users = await User.find(query)
      .select("username profile createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user._id;

    if (userId === "me") {
      return getCurrentUser(req, res);
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check connection status
    const connection = await Connection.findOne({
      $or: [
        { fromUser: currentUserId, toUser: userId },
        { fromUser: userId, toUser: currentUserId },
      ],
    });

    // Check if liked
    const like = await Like.findOne({
      fromUser: currentUserId,
      toUser: userId,
    });

    console.log(user);

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        connectionStatus: connection ? connection.status : "none",
        liked: !!like,
      },
    });
  } catch (error) {
    console.error("Error in getUserById:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get users for the queue feature
 * Returns users that don't have any connection with the current user
 */
const getUserQueue = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find all user IDs that have connections with the current user
    const connections = await Connection.find({
      $or: [{ fromUser: currentUserId }, { toUser: currentUserId }],
    });

    const connectedUserIds = connections.map((conn) => {
      return conn.fromUser.toString() === currentUserId.toString()
        ? conn.toUser
        : conn.fromUser;
    });

    // Add current user ID to the exclusion list
    connectedUserIds.push(currentUserId);

    // Find users not in the connected list
    const queueUsers = await User.find({
      _id: { $nin: connectedUserIds },
    })
      .select("username profile createdAt")
      .limit(10)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users: queueUsers,
    });
  } catch (error) {
    console.error("Error in getUserQueue:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get users the current user has liked
 */
const getUsersILiked = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const likes = await Like.find({ fromUser: currentUserId })
      .populate("toUser", "username profile")
      .sort({ createdAt: -1 });

    const users = likes.map((like) => ({
      id: like.toUser._id,
      username: like.toUser.username,
      profile: like.toUser.profile,
      likedAt: like.createdAt,
    }));

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error in getUsersILiked:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get users who liked the current user
 */
const getUsersWhoLikedMe = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const likes = await Like.find({ toUser: currentUserId })
      .populate("fromUser", "username profile")
      .sort({ createdAt: -1 });

    const users = likes.map((like) => ({
      id: like.fromUser._id,
      username: like.fromUser.username,
      profile: like.fromUser.profile,
      likedAt: like.createdAt,
    }));

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error in getUsersWhoLikedMe:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Broadcast a message to all users
 */
const broadcastMessage = async (req, res) => {
  try {
    const { notificationTemplateId } = req.body;
    const currentUser = req.user;

    if (!notificationTemplateId) {
      return res.status(400).json({
        success: false,
        message: "Notification template ID is required",
      });
    }

    // Fetch the notification template by ID
    const template = await NotificationTemplate.findById(
      notificationTemplateId
    );
    if (!template || template.type !== "broadcast") {
      return res.status(404).json({
        success: false,
        message: "Valid broadcast-type notification template not found",
      });
    }

    // Optionally, store the broadcast being sent (if required)
    const broadcast = new BroadcastMessage({
      fromUser: currentUser._id,
      message: template.messageTemplate,
    });
    await broadcast.save();

    // Get all users except the current user
    const users = await User.find({ _id: { $ne: currentUser._id } }).select(
      "_id"
    );
    const userIds = users.map((user) => user._id);

    // Send notifications to all users using the message from the template
    await notificationService.queueBroadcastNotification(
      currentUser._id,
      userIds,
      currentUser.username,
      template.messageTemplate
    );

    return res.status(200).json({
      success: true,
      message: "Broadcast message sent using template",
      broadcast: {
        id: broadcast._id,
        message: broadcast.message,
        createdAt: broadcast.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in broadcastMessage:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get broadcast messages
 */
const getBroadcastMessages = async (req, res) => {
  try {
    const broadcasts = await BroadcastMessage.find()
      .populate("fromUser", "username ")
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      broadcasts,
    });
  } catch (error) {
    console.error("Error in getBroadcastMessages:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { bio, avatarUrl } = req.body;
    const currentUser = req.user;

    const updates = {
      "profile.bio": bio !== undefined ? bio : currentUser.profile.bio,
      "profile.avatarUrl":
        avatarUrl !== undefined ? avatarUrl : currentUser.profile.avatarUrl,
    };

    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      { $set: updates },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        profile: updatedUser.profile,
      },
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getCurrentUser,
  getAllUsers,
  getUserById,
  getUserQueue,
  getUsersILiked,
  getUsersWhoLikedMe,
  broadcastMessage,
  getBroadcastMessages,
  updateProfile,
};
