const sqsService = require("../services/sqs.service");
const notificationService = require("../services/notification.service");

/**
 * Worker to process notifications from SQS queue
 */
const processQueue = async () => {
  try {
    console.log("Starting to process notification queue...");

    // Receive messages from SQS
    const messages = await sqsService.processNotificationQueue();

    if (messages.length === 0) {
      console.log("No messages to process");
      return;
    }

    console.log(`Processing ${messages.length} messages...`);

    // Process each message
    for (const message of messages) {
      try {
        if (message.type === "create_notification") {
          const { userId, templateType, fromUserId, data } = message.data;

          // Create notification in database
          await notificationService.createNotification(
            userId,
            templateType,
            fromUserId,
            data
          );

          console.log(
            `Created notification: ${templateType} for user: ${userId}`
          );
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    }

    console.log("Queue processing completed");
  } catch (error) {
    console.error("Error in processQueue:", error);
  }
};

// For manual execution during development
if (require.main === module) {
  processQueue()
    .then(() => {
      console.log("Worker execution completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Worker execution failed:", error);
      process.exit(1);
    });
}

module.exports = {
  processQueue,
};
