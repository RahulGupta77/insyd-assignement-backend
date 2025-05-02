const notificationService = require("../services/notification.service");

/**
 * Get all notifications for the current user
 */
const getNotifications = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { isRead } = req.query;

    let filter = {};
    if (isRead !== undefined) {
      filter.isRead = isRead === "true";
    }

    const notifications = await notificationService.getUserNotifications(
      currentUserId,
      filter
    );

    const formattedNotifications = notifications.map((notification) => {
      // Format the notification message with template data
      let message = notification.templateId.messageTemplate;
      if (notification.data) {
        Object.keys(notification.data).forEach((key) => {
          message = message.replace(`{{${key}}}`, notification.data[key]);
        });
      }

      return {
        id: notification._id,
        type: notification.templateId.type,
        title: notification.templateId.title,
        message,
        isRead: notification.isRead,
        fromUser: notification.fromUser
          ? {
              id: notification.fromUser._id,
              username: notification.fromUser.username,
              avatarUrl: notification.fromUser.profile?.avatarUrl,
            }
          : null,
        createdAt: notification.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      notifications: formattedNotifications,
    });
  } catch (error) {
    console.error("Error in getNotifications:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Mark notifications as read
 */
const markAsRead = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { notificationIds } = req.body;

    if (
      !notificationIds ||
      !Array.isArray(notificationIds) ||
      notificationIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification IDs",
      });
    }

    const updatedCount = await notificationService.markNotificationsAsRead(
      currentUserId,
      notificationIds
    );

    return res.status(200).json({
      success: true,
      message: "Notifications marked as read",
      count: updatedCount,
    });
  } catch (error) {
    console.error("Error in markAsRead:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const count = await notificationService.getUnreadCount(currentUserId);

    return res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Error in getUnreadCount:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  getUnreadCount,
};
