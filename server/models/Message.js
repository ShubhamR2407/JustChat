const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
    },
    file: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", MessageSchema);
