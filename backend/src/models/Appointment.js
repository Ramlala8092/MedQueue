
// const mongoose = require("mongoose");

// const appointmentSchema = new mongoose.Schema(
//   {
//     patient: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: false,
//       default: null,
//     },

//     patientName: { type: String, trim: true, default: "" },
//     patientPhone: { type: String, trim: true, default: "" },
//     isWalkIn: { type: Boolean, default: false },

//     doctor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Doctor",
//       required: true,
//     },

//     // Patient ki preference
//     consultationPreference: {
//       type: String,
//       enum: ["online", "clinic", "both"],
//       required: true,
//       default: "online",
//     },

//     // Doctor ka final selection
//     consultationMode: {
//       type: String,
//       enum: ["online", "clinic", null],
//       default: null,
//     },

//     appointmentAt: {
//       type: Date,
//       required: true,
//     },

//     durationMinutes: {
//       type: Number,
//       enum: [10, 15, 30, 45, 60],
//       required: true,
//       default: 30,
//     },

//     endAt: {
//       type: Date,
//       required: true,
//     },

//     reason: {
//       type: String,
//       trim: true,
//       maxlength: 500,
//       default: "",
//     },

//     status: {
//       type: String,
//       enum: ["pending", "confirmed", "cancelled", "completed"],
//       default: "pending",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Appointment", appointmentSchema);















const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    // Registered patient; walk-in patients may not have an account.
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },

    patientName: {
      type: String,
      trim: true,
      default: "",
    },

    patientPhone: {
      type: String,
      trim: true,
      default: "",
    },

    isWalkIn: {
      type: Boolean,
      default: false,
    },

    // The appointment belongs to this doctor only.
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // Patient's consultation preference.
    consultationPreference: {
      type: String,
      enum: ["online", "clinic", "both"],
      required: true,
      default: "online",
    },

    // Doctor's final consultation mode.
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

    // Existing appointment status.
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    // Queue token assigned when the appointment is confirmed.
    // Token numbering will be separate for each doctor and date.
    tokenNumber: {
      type: Number,
      min: 1,
      default: null,
    },

    // Appointment's queue date in YYYY-MM-DD format.
    queueDate: {
      type: String,
      default: null,
    },

    // How this appointment was confirmed.
    approvalType: {
      type: String,
      enum: ["manual", "auto", "walk_in", null],
      default: null,
    },

    confirmedAt: {
      type: Date,
      default: null,
    },

    // Treatment progress inside the doctor's queue.
    treatmentStatus: {
      type: String,
      enum: ["not_started", "waiting", "in_consultation", "completed"],
      default: "not_started",
    },

    treatmentStartedAt: {
      type: Date,
      default: null,
    },

    treatmentCompletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Useful indexes for doctor-specific appointment queries.
appointmentSchema.index({ doctor: 1, appointmentAt: 1 });
appointmentSchema.index({ doctor: 1, status: 1 });

// Prevent duplicate queue tokens for the same doctor on the same date.
// This index applies only when tokenNumber is a number.
appointmentSchema.index(
  { doctor: 1, queueDate: 1, tokenNumber: 1 },
  {
    unique: true,
    partialFilterExpression: {
      tokenNumber: { $type: "number" },
    },
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
