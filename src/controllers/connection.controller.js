const { Connection } = require("../models/connection.model");
const { User } = require("../models/user.model");
const notificationService = require("../services/notification.service");

/**
 * Send a connection request to a user
 */
const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUser = req.user;

    if (userId === currentUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot send connection request to yourself",
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

    // Check if a connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { fromUser: currentUser._id, toUser: userId },
        { fromUser: userId, toUser: currentUser._id },
      ],
    });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: "Connection already exists",
        status: existingConnection.status,
      });
    }

    // Create new connection
    const connection = new Connection({
      fromUser: currentUser._id,
      toUser: userId,
      status: "pending",
    });

    await connection.save();

    // Queue notification
    await notificationService.queueConnectionNotification(
      currentUser._id,
      userId,
      currentUser.username
    );

    return res.status(201).json({
      success: true,
      message: "Connection request sent",
      connection: {
        id: connection._id,
        status: connection.status,
        createdAt: connection.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in sendConnectionRequest:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Skip a user (mark as skipped)
 */
const skipUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUser = req.user;

    // Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if a connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { fromUser: currentUser._id, toUser: userId },
        { fromUser: userId, toUser: currentUser._id },
      ],
    });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: "Connection already exists",
        status: existingConnection.status,
      });
    }

    // Create new connection with skipped status
    const connection = new Connection({
      fromUser: currentUser._id,
      toUser: userId,
      status: "skipped",
    });

    await connection.save();

    // No notification for skipped users

    return res.status(201).json({
      success: true,
      message: "User skipped",
      connection: {
        id: connection._id,
        status: connection.status,
        createdAt: connection.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in skipUser:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get all sent connection requests
 */
const getSentConnections = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { status } = req.query;

    let query = { fromUser: currentUserId };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const connections = await Connection.find(query)
      .populate("toUser", "username profile")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      connections: connections.map((conn) => ({
        id: conn._id,
        user: {
          id: conn.toUser._id,
          username: conn.toUser.username,
          profile: conn.toUser.profile,
        },
        status: conn.status,
        createdAt: conn.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error in getSentConnections:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get all received connection requests
 */
const getReceivedConnections = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { status } = req.query;

    let query = { toUser: currentUserId };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const connections = await Connection.find(query)
      .populate("fromUser", "username profile")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      connections: connections.map((conn) => ({
        id: conn._id,
        user: {
          id: conn.fromUser._id,
          username: conn.fromUser.username,
          profile: conn.fromUser.profile,
        },
        status: conn.status,
        createdAt: conn.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error in getReceivedConnections:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Respond to a connection request (accept or reject)
 */
const respondToConnection = async (req, res) => {
  try {
    const { connectionId, action } = req.body;
    const currentUserId = req.user._id;
    const currentUser = req.user;

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "accept" or "reject"',
      });
    }

    // Find the connection
    const connection = await Connection.findOne({
      _id: connectionId,
      toUser: currentUserId,
      status: "pending",
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found or already processed",
      });
    }

    // Update status based on action
    connection.status = action === "accept" ? "accepted" : "rejected";
    await connection.save();

    // Queue notification
    if (connection.status === "accepted") {
      await notificationService.queueConnectionAcceptedNotification(
        connection.toUser,
        connection.fromUser,
        currentUser.username
      );
    } else if (connection.status === "rejected") {
      await notificationService.queueConnectionRejectedNotification(
        connection.toUser,
        connection.fromUser,
        currentUser.username
      );
    }

    return res.status(200).json({
      success: true,
      message: `Connection request ${action}ed`,
      connection: {
        id: connection._id,
        status: connection.status,
        updatedAt: connection.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error in respondToConnection:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  sendConnectionRequest,
  skipUser,
  getSentConnections,
  getReceivedConnections,
  respondToConnection,
};
