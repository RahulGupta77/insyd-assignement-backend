const AWS = require("aws-sdk");
require("dotenv").config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const sqs = new AWS.SQS();
const QUEUE_URL =
  "https://sqs.ap-south-1.amazonaws.com/462791228907/insyd-sqs-queue";

const sendMessage = async (messageBody) => {
  try {
    const params = {
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(messageBody),
      MessageAttributes: {
        MessageType: {
          DataType: "String",
          StringValue: messageBody.type || "notification",
        },
      },
    };

    const result = await sqs.sendMessage(params).promise();
    console.log(`Message sent to SQS: ${result.MessageId}`);
    return result.MessageId;
  } catch (error) {
    console.error("Error sending message to SQS:", error);
    throw error;
  }
};

// Process notifications from SQS
// This would typically be run in a separate worker process
const processNotificationQueue = async () => {
  try {
    const params = {
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    };

    const data = await sqs.receiveMessage(params).promise();

    if (!data.Messages || data.Messages.length === 0) {
      console.log("No messages to process");
      return [];
    }

    const processedMessages = [];

    for (const message of data.Messages) {
      try {
        const body = JSON.parse(message.Body);
        console.log("Processing message:", body);

        // Process the notification here or call your notification service
        // await notificationService.createNotification(body);

        await sqs
          .deleteMessage({
            QueueUrl: QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle,
          })
          .promise();

        processedMessages.push(body);
      } catch (error) {
        console.error("Error processing message:", error);
      }
    }

    return processedMessages;
  } catch (error) {
    console.error("Error receiving messages from SQS:", error);
    throw error;
  }
};

module.exports = {
  sendMessage,
  processNotificationQueue,
};
