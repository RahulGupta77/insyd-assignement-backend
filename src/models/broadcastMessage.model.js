const mongoose = require("mongoose");
const { Schema } = mongoose;

const broadcastMessageSchema = new Schema(
  {
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const BroadcastMessage = mongoose.model(
  "BroadcastMessage",
  broadcastMessageSchema
);

module.exports = { BroadcastMessage };
