const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // receiver
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "NotificationTemplate",
      required: true,
    },
    fromUser: { type: Schema.Types.ObjectId, ref: "User" }, // optional actor
    data: {
      type: Object, // key-value pairs for template replacement
      default: {},
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Notification };
