
const mongoose = require("mongoose");

const queueCounterSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // Queue date format: YYYY-MM-DD
    queueDate: {
      type: String,
      required: true,
    },

    lastTokenNumber: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Each doctor gets a separate counter for each date.
queueCounterSchema.index(
  { doctor: 1, queueDate: 1 },
  { unique: true }
);

module.exports = mongoose.model("QueueCounter", queueCounterSchema);



