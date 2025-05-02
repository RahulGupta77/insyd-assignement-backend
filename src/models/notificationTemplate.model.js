const mongoose = require("mongoose");

const notificationTemplateSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "like",
        "unlike",
        "broadcast",
        "connection_request",
        "connection_accepted",
        "connection_rejected",
        "connection_reminder",
        "connection_removed",
      ],
      required: true,
    },
    title: { type: String, required: true },
    messageTemplate: { type: String, required: true },
    variables: [String],
  },
  { timestamps: true }
);

const NotificationTemplate = mongoose.model(
  "NotificationTemplate",
  notificationTemplateSchema
);

module.exports = { NotificationTemplate };
