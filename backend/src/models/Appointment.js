
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },

    patientName: { type: String, trim: true, default: "" },
    patientPhone: { type: String, trim: true, default: "" },
    isWalkIn: { type: Boolean, default: false },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // Patient ki preference
    consultationPreference: {
      type: String,
      enum: ["online", "clinic", "both"],
      required: true,
      default: "online",
    },

    // Doctor ka final selection
    consultationMode: {
      type: String,
      enum: ["online", "clinic", null],
      default: null,
    },

    appointmentAt: {
      type: Date,
      required: true,
    },

    durationMinutes: {
      type: Number,
      enum: [10, 15, 30, 45, 60],
      required: true,
      default: 30,
    },

    endAt: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);

