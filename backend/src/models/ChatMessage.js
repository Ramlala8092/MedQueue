const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    imageFilename: {
      type: String,
      default: "",
    },
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  { timestamps: true }
);

chatMessageSchema.index({ appointment: 1, createdAt: 1 });
chatMessageSchema.index({ appointment: 1, readBy: 1, sender: 1 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
