const mongoose = require("mongoose");
const { Schema } = mongoose;

const connectionSchema = new Schema(
  {
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["none", "pending", "accepted", "rejected", "skipped"],
      default: "none",
    },
  },
  { timestamps: true }
);

const Connection = mongoose.model("Connection", connectionSchema);

module.exports = { Connection };
