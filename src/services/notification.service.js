const { Notification } = require("../models/notification.model");
const {
  NotificationTemplate,
} = require("../models/notificationTemplate.model");
const sqsService = require("./sqs.service");

/**
 * Sends a notification to SQS for async processing
 */
const queueNotification = async (notificationData) => {
  try {
    await sqsService.sendMessage({
      type: "create_notification",
      data: notificationData,
    });
    return true;
  } catch (error) {
    console.error("Error queuing notification:", error);
    throw error;
  }
};

/**
 * Creates a notification in the database
 */
const createNotification = async (
  userId,
  templateType,
  fromUserId = null,
  data = {}
) => {
  try {
    // Find the notification template
    const template = await NotificationTemplate.findOne({ type: templateType });
    if (!template) {
      throw new Error(`Notification template not found: ${templateType}`);
    }

    // Create the notification in the database
    const notification = new Notification({
      user: userId,
      templateId: template._id,
      fromUser: fromUserId,
      data: data,
      isRead: false,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Queue a notification for connection request
 */
const queueConnectionNotification = async (fromUserId, toUserId, username) => {
  return queueNotification({
    userId: toUserId,
    templateType: "connection_request",
    fromUserId: fromUserId,
    data: { username },
  });
};

/**
 * Queue a notification for connection accepted
 */
const queueConnectionAcceptedNotification = async (
  fromUserId,
  toUserId,
  username
) => {
  return queueNotification({
    userId: toUserId,
    templateType: "connection_accepted",
    fromUserId: fromUserId,
    data: { username },
  });
};

/**
 * Queue a notification for connection rejected
 */
const queueConnectionRejectedNotification = async (
  fromUserId,
  toUserId,
  username
) => {
  return queueNotification({
    userId: toUserId,
    templateType: "connection_rejected",
    fromUserId: fromUserId,
    data: { username },
  });
};

/**
 * Queue a notification for likes
 */
const queueLikeNotification = async (fromUserId, toUserId, username) => {
  return queueNotification({
    userId: toUserId,
    templateType: "like",
    fromUserId: fromUserId,
    data: { username },
  });
};

/**
 * Queue a notification for broadcast messages
 */
const queueBroadcastNotification = async (
  fromUserId,
  targetUserIds,
  username,
  message
) => {
  const notificationPromises = targetUserIds.map((userId) => {
    return queueNotification({
      userId,
      templateType: "broadcast",
      fromUserId,
      data: { username, message },
    });
  });

  return Promise.all(notificationPromises);
};

/**
 * Get notifications for a user
 */
const getUserNotifications = async (userId, filter = {}) => {
  try {
    const query = { user: userId, ...filter };

    const notifications = await Notification.find(query)
      .populate("templateId")
      .populate("fromUser", "username profile.avatarUrl")
      .sort({ createdAt: -1 });

    return notifications;
  } catch (error) {
    console.error("Error getting user notifications:", error);
    throw error;
  }
};

/**
 * Mark notifications as read
 */
const markNotificationsAsRead = async (userId, notificationIds) => {
  try {
    const result = await Notification.updateMany(
      {
        user: userId,
        _id: { $in: notificationIds },
      },
      { $set: { isRead: true } }
    );

    return result.modifiedCount;
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw error;
  }
};

/**
 * Get unread notification count for a user
 */
const getUnreadCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    return count;
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    throw error;
  }
};

module.exports = {
  queueNotification,
  createNotification,
  queueConnectionNotification,
  queueConnectionAcceptedNotification,
  queueConnectionRejectedNotification,
  queueLikeNotification,
  queueBroadcastNotification,
  getUserNotifications,
  markNotificationsAsRead,
  getUnreadCount,
};
