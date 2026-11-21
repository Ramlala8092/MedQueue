


// const express = require("express");
// const mongoose = require("mongoose");

// const Appointment = require("../models/Appointment");
// const Doctor = require("../models/Doctor");
// const { protect } = require("../middleware/authMiddleware");

// const router = express.Router();

// const ALLOWED_DURATIONS = [10, 15, 30, 45, 60];

// // POST /api/appointments
// // Patient creates a pending appointment request
// router.post("/", protect, async (req, res) => {
//   try {
//     if (req.user.role !== "patient") {
//       return res.status(403).json({
//         success: false,
//         message: "Only patients can book appointments.",
//       });
//     }

//     const {
//   doctorId,
//   appointmentAt,
//   durationMinutes = 30,
//   reason = "",
//   consultationPreference,
// } = req.body;

//     if (!mongoose.isValidObjectId(doctorId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid doctor ID is required.",
//       });
//     }

//     const startAt = new Date(appointmentAt);

//     if (
//       !appointmentAt ||
//       Number.isNaN(startAt.getTime()) ||
//       startAt <= new Date()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Please select a valid future appointment date.",
//       });
//     }

//     if (!ALLOWED_DURATIONS.includes(Number(durationMinutes))) {
//       return res.status(400).json({
//         success: false,
//         message: "Duration must be 10, 15, 30, 45 or 60 minutes.",
//       });
//     }

//     if (typeof reason !== "string" || reason.length > 500) {
//       return res.status(400).json({
//         success: false,
//         message: "Reason must be 500 characters or fewer.",
//       });
//     }

//     const doctor = await Doctor.findOne({
//       _id: doctorId,
//       verificationStatus: "approved",
//       isVerified: true,
//       isActive: true,
//     });

//     if (!doctor) {
//       return res.status(404).json({
//         success: false,
//         message: "Approved doctor not found.",
//       });
//     }

//     const duration = Number(durationMinutes);
//     const endAt = new Date(startAt.getTime() + duration * 60 * 1000);

//     // Pending requests do not reserve a slot.
//     // The final availability check happens when the doctor confirms.
//     const appointment = await Appointment.create({
//       patient: req.user._id,
//       doctor: doctor._id,
//       appointmentAt: startAt,
//       durationMinutes: duration,
//       endAt,
//       reason: reason.trim(),
//       status: "pending",
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Appointment request submitted successfully.",
//       appointment,
//     });
//   } catch (error) {
//     console.error("Book appointment error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to book appointment.",
//     });
//   }
// });

// // GET /api/appointments/mine
// // Patient sees their bookings; doctor sees their own requests
// router.get("/mine", protect, async (req, res) => {
//   try {
//     let filter;
//     let populateFields;

//     if (req.user.role === "patient") {
//       filter = { patient: req.user._id };

//       populateFields = {
//         path: "doctor",
//         select: "name specialization qualification profileImage consultationFee",
//       };
//     } else if (req.user.role === "doctor") {
//       const doctor = await Doctor.findOne({
//         user: req.user._id,
//       }).select("_id");

//       if (!doctor) {
//         return res.status(404).json({
//           success: false,
//           message: "Doctor profile not found.",
//         });
//       }

//       filter = { doctor: doctor._id };

//       populateFields = {
//         path: "patient",
//         select: "name email phone",
//       };
//     } else {
//       return res.status(403).json({
//         success: false,
//         message: "Patients and doctors only.",
//       });
//     }

//     const appointments = await Appointment.find(filter)
//       .populate(populateFields)
//       .sort({ appointmentAt: 1 });

//     return res.status(200).json({
//       success: true,
//       appointments,
//     });
//   } catch (error) {
//     console.error("Get appointments error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to load appointments.",
//     });
//   }
// });

// // PATCH /api/appointments/:id/status
// // Doctor confirms or cancels their own pending request
// router.patch("/:id/status", protect, async (req, res) => {
//   try {
//     if (req.user.role !== "doctor") {
//       return res.status(403).json({
//         success: false,
//         message: "Only doctors can update appointment status.",
//       });
//     }

//     if (!mongoose.isValidObjectId(req.params.id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid appointment ID.",
//       });
//     }

//     const { status } = req.body;

//     if (!["confirmed", "cancelled"].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Status must be confirmed or cancelled.",
//       });
//     }

//     const doctor = await Doctor.findOne({
//       user: req.user._id,
//       verificationStatus: "approved",
//       isVerified: true,
//       isActive: true,
//     }).select("_id");

//     if (!doctor) {
//       return res.status(403).json({
//         success: false,
//         message: "Approved active doctor profile required.",
//       });
//     }

//     const appointment = await Appointment.findOne({
//       _id: req.params.id,
//       doctor: doctor._id,
//       status: "pending",
//     });

//     if (!appointment) {
//       return res.status(404).json({
//         success: false,
//         message: "Pending appointment not found for your account.",
//       });
//     }

//     if (status === "confirmed") {
//       const requestedStart = appointment.appointmentAt;
//       const duration = appointment.durationMinutes || 30;
//       const requestedEnd =
//         appointment.endAt ||
//         new Date(requestedStart.getTime() + duration * 60 * 1000);

//       // Read confirmed appointments for this doctor.
//       // The fallback supports older records without endAt.
//       const confirmedAppointments = await Appointment.find({
//         doctor: doctor._id,
//         status: "confirmed",
//         _id: { $ne: appointment._id },
//       }).select("_id appointmentAt endAt durationMinutes");

//       const conflict = confirmedAppointments.find((existing) => {
//         const existingStart = existing.appointmentAt;
//         const existingDuration = existing.durationMinutes || 30;
//         const existingEnd =
//           existing.endAt ||
//           new Date(
//             existingStart.getTime() + existingDuration * 60 * 1000
//           );

//         // Intervals overlap if each starts before the other ends.
//         return (
//           requestedStart < existingEnd &&
//           requestedEnd > existingStart
//         );
//       });

//       if (conflict) {
//         return res.status(409).json({
//           success: false,
//           message:
//             "This time slot is already booked. Please choose another time.",
//         });
//       }

//       appointment.endAt = requestedEnd;
//     }

//     appointment.status = status;
//     await appointment.save();

//     return res.status(200).json({
//       success: true,
//       message: `Appointment ${status} successfully.`,
//       appointment,
//     });
//   } catch (error) {
//     console.error("Update appointment error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to update appointment.",
//     });
//   }
// });

// module.exports = router;




const express = require("express");
const mongoose = require("mongoose");

const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const ALLOWED_DURATIONS = [10, 15, 30, 45, 60];

const ALLOWED_PREFERENCES = ["online", "clinic", "both"];
const ALLOWED_MODES = ["online", "clinic"];

// POST /api/appointments
// Patient creates a pending appointment request
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can book appointments.",
      });
    }

    const {
      doctorId,
      appointmentAt,
      durationMinutes = 30,
      reason = "",
      consultationPreference,
    } = req.body;

    // Validate doctor ID
    if (!mongoose.isValidObjectId(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Valid doctor ID is required.",
      });
    }

    // Validate consultation preference
    if (!ALLOWED_PREFERENCES.includes(consultationPreference)) {
      return res.status(400).json({
        success: false,
        message: "Please select online, clinic or both consultation.",
      });
    }

    // Validate appointment date
    const startAt = new Date(appointmentAt);

    if (
      !appointmentAt ||
      Number.isNaN(startAt.getTime()) ||
      startAt <= new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid future appointment date.",
      });
    }

    // Validate duration
    if (!ALLOWED_DURATIONS.includes(Number(durationMinutes))) {
      return res.status(400).json({
        success: false,
        message: "Duration must be 10, 15, 30, 45 or 60 minutes.",
      });
    }

    // Validate reason
    if (typeof reason !== "string" || reason.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Reason must be 500 characters or fewer.",
      });
    }

    // Find approved doctor
    const doctor = await Doctor.findOne({
      _id: doctorId,
      verificationStatus: "approved",
      isVerified: true,
      isActive: true,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Approved doctor not found.",
      });
    }

    const duration = Number(durationMinutes);

    const endAt = new Date(
      startAt.getTime() + duration * 60 * 1000
    );

    // Create appointment request
    const initialStatus = doctor.isAutoConfirm ? "confirmed" : "pending";
    const initialMode = consultationPreference === "both"
      ? null
      : consultationPreference;

    if (initialStatus === "confirmed") {
      const existingConfirmed = await Appointment.find({
        doctor: doctor._id,
        status: "confirmed",
      }).select("appointmentAt endAt durationMinutes");

      const conflict = existingConfirmed.some((existing) => {
        const existingStart = existing.appointmentAt;
        const existingEnd = existing.endAt || new Date(
          existingStart.getTime() + (existing.durationMinutes || 30) * 60000
        );
        return startAt < existingEnd && endAt > existingStart;
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: "This time slot is already booked. Please choose another time.",
        });
      }
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctor._id,
      consultationPreference,
      consultationMode: initialMode,
      appointmentAt: startAt,
      durationMinutes: duration,
      endAt,
      reason: reason.trim(),
      status: initialStatus,
    });

    return res.status(201).json({
      success: true,
      message: initialStatus === "confirmed"
        ? "Appointment confirmed successfully."
        : "Appointment request submitted successfully.",
      appointment,
    });

  } catch (error) {
    console.error("Book appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to book appointment.",
    });
  }
});


// POST /api/appointments/walk-in
// Doctor registers an offline clinic patient into the same appointment queue.
router.post("/walk-in", protect, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only the doctor account can register walk-in patients.",
      });
    }

    const patientName = typeof req.body?.patientName === "string"
      ? req.body.patientName.trim()
      : "";
    const patientPhone = typeof req.body?.patientPhone === "string"
      ? req.body.patientPhone.trim()
      : "";

    if (!patientName || !patientPhone) {
      return res.status(400).json({
        success: false,
        message: "Patient name and phone are required.",
      });
    }

    if (patientName.length > 100 || patientPhone.length > 20) {
      return res.status(400).json({
        success: false,
        message: "Patient name or phone is too long.",
      });
    }

    const doctor = await Doctor.findOne({
      user: req.user._id,
      verificationStatus: "approved",
      isVerified: true,
      isActive: true,
    }).select("_id");

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: "Approved active doctor profile required.",
      });
    }

    const now = new Date();
    const appointment = await Appointment.create({
      patient: null,
      patientName,
      patientPhone,
      isWalkIn: true,
      doctor: doctor._id,
      consultationPreference: "clinic",
      consultationMode: "clinic",
      appointmentAt: now,
      durationMinutes: 30,
      endAt: new Date(now.getTime() + 30 * 60000),
      reason: "Walk-in patient",
      status: "confirmed",
    });

    return res.status(201).json({
      success: true,
      message: "Walk-in patient added to the queue.",
      appointment,
    });
  } catch (error) {
    console.error("Walk-in registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add walk-in patient.",
    });
  }
});

// GET /api/appointments/mine
// Patient sees their bookings; doctor sees their own requests
router.get("/mine", protect, async (req, res) => {
  try {
    let filter;
    let populateFields;

    if (req.user.role === "patient") {
      filter = {
        patient: req.user._id,
      };

      populateFields = {
        path: "doctor",
        select: "name specialization qualification profileImage consultationFee",
      };

    } else if (req.user.role === "doctor") {

      const doctor = await Doctor.findOne({
        user: req.user._id,
      }).select("_id");

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found.",
        });
      }

      filter = {
        doctor: doctor._id,
      };

      populateFields = {
        path: "patient",
        select: "name email phone",
      };

    } else {
      return res.status(403).json({
        success: false,
        message: "Patients and doctors only.",
      });
    }

    const appointments = await Appointment.find(filter)
      .populate(populateFields)
      .sort({ appointmentAt: 1 });

    return res.status(200).json({
      success: true,
      appointments,
    });

  } catch (error) {
    console.error("Get appointments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load appointments.",
    });
  }
});


// PATCH /api/appointments/:id/status
// Doctor accepts online/clinic consultation or cancels request
router.patch("/:id/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can update appointment status.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID.",
      });
    }

    const { status, consultationMode } = req.body;

    // Validate status
    if (!["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be confirmed or cancelled.",
      });
    }

    // Online/clinic mode is required when accepting
    if (
      status === "confirmed" &&
      !ALLOWED_MODES.includes(consultationMode)
    ) {
      return res.status(400).json({
        success: false,
        message: "Doctor must select online or clinic consultation mode.",
      });
    }

    // Find approved doctor
    const doctor = await Doctor.findOne({
      user: req.user._id,
      verificationStatus: "approved",
      isVerified: true,
      isActive: true,
    }).select("_id");

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: "Approved active doctor profile required.",
      });
    }

    // Find doctor's pending appointment
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: doctor._id,
      status: "pending",
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Pending appointment not found for your account.",
      });
    }

    // Check patient preference
    const patientPreference =
      appointment.consultationPreference || "online";

    if (
      status === "confirmed" &&
      patientPreference !== consultationMode
    ) {
      // Doctor can choose any one mode if patient selected both
      if (patientPreference !== "both") {
        return res.status(400).json({
          success: false,
          message:
            "You can only accept the consultation mode selected by the patient.",
        });
      }
    }

    if (status === "confirmed") {

      const requestedStart = appointment.appointmentAt;

      const duration = appointment.durationMinutes || 30;

      const requestedEnd =
        appointment.endAt ||
        new Date(
          requestedStart.getTime() + duration * 60 * 1000
        );

      // Find existing confirmed appointments
      const confirmedAppointments = await Appointment.find({
        doctor: doctor._id,
        status: "confirmed",
        _id: { $ne: appointment._id },
      }).select("_id appointmentAt endAt durationMinutes");

      // Check overlapping appointment slots
      const conflict = confirmedAppointments.find((existing) => {

        const existingStart = existing.appointmentAt;

        const existingDuration =
          existing.durationMinutes || 30;

        const existingEnd =
          existing.endAt ||
          new Date(
            existingStart.getTime() +
              existingDuration * 60 * 1000
          );

        return (
          requestedStart < existingEnd &&
          requestedEnd > existingStart
        );
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message:
            "This time slot is already booked. Please choose another time.",
        });
      }

      appointment.endAt = requestedEnd;

      // Save doctor's selected consultation mode
      appointment.consultationMode = consultationMode;
    }

    appointment.status = status;

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully.`,
      appointment,
    });

  } catch (error) {
    console.error("Update appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update appointment.",
    });
  }
});


module.exports = router;
