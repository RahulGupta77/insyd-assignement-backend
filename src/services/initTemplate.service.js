const {
  NotificationTemplate,
} = require("../models/notificationTemplate.model");

/**
 * Initialize default notification templates
 */
const initializeNotificationTemplates = async () => {
  try {
    const templates = [
      {
        type: "connection_request",
        title: "New Connection Request",
        messageTemplate: "{{username}} sent you a connection request",
        variables: ["username"],
      },
      {
        type: "like",
        title: "New Like",
        messageTemplate: "{{username}} liked your profile",
        variables: ["username"],
      },
      {
        type: "broadcast",
        title: "New Broadcast Message",
        messageTemplate: "{{username}} sent a broadcast: {{message}}",
        variables: ["username", "message"],
      },
    ];

    // For each template, create if it doesn't exist
    for (const template of templates) {
      const exists = await NotificationTemplate.findOne({
        type: template.type,
      });
      if (!exists) {
        await NotificationTemplate.create(template);
        console.log(`Created notification template: ${template.type}`);
      }
    }

    console.log("Notification templates initialized successfully");
  } catch (error) {
    console.error("Error initializing notification templates:", error);
  }
};

module.exports = {
  initializeNotificationTemplates,
};
