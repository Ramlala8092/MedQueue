

const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    qualification: { type: String, required: true, trim: true },
    experienceYears: { type: Number, min: 0, required: true },
    consultationFee: { type: Number, min: 0, required: true },
    address: { type: String, required: true, trim: true },

    profileImage: { type: String, required: true },
    degreeCertificate: { type: String, required: true },
    medicalRegistrationNumber: {
      type: String,
      required: true,
      trim: true,
    },
    registrationCertificate: { type: String, required: true },

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isAutoConfirm: { type: Boolean, default: true },
    isOnBreak: { type: Boolean, default: false },
    breakMessage: {
      type: String,
      trim: true,
      default: "Doctor is currently on a short break",
    },
    referralCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);



