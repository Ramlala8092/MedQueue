


const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const express = require("express");
const mongoose = require("mongoose");

const Appointment = require("../models/Appointment");
const ChatMessage = require("../models/ChatMessage");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");
const PRIVATE_DOCUMENTS_DIR = path.resolve(
  UPLOADS_DIR,
  "private-documents"
);

// Safely delete files only from their expected upload directories.
async function removeUploadedFile(storedPath, folder) {
  if (typeof storedPath !== "string" || !storedPath.trim()) {
    return;
  }

  const normalized = storedPath.replace(/\\/g, "/");
  const filename = path.basename(normalized);

  if (
    !filename ||
    filename === "." ||
    filename === ".." ||
    filename.includes("\0")
  ) {
    return;
  }

  const expectedSegment = `/uploads/${folder}/`;

  if (
    normalized.includes("/uploads/") &&
    !normalized.includes(expectedSegment)
  ) {
    console.error("Skipped unexpected uploaded file path.");
    return;
  }

  const directory = path.resolve(UPLOADS_DIR, folder);
  const fullPath = path.resolve(directory, filename);

  if (!fullPath.startsWith(directory + path.sep)) {
    return;
  }

  try {
    await fs.promises.unlink(fullPath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Uploaded file cleanup failed:", error.message);
    }
  }
}

async function removeDoctorFiles(doctor) {
  await Promise.all([
    removeUploadedFile(doctor.profileImage, "profile-images"),
    removeUploadedFile(doctor.degreeCertificate, "private-documents"),
    removeUploadedFile(
      doctor.registrationCertificate,
      "private-documents"
    ),
  ]);
}
// Home page: Show only 6 random approved doctors
router.get("/home/random", async (req, res) => {
  try {
    const doctors = await Doctor.aggregate([
      {
        $match: {
          isActive: true,
          verificationStatus: "approved",
          isVerified: true,
        },
      },
      { $sample: { size: 6 } },
      {
        $project: {
          _id: 1,
          name: 1,
          specialization: 1,
          qualification: 1,
          experienceYears: 1,
          consultationFee: 1,
          address: 1,
          city: 1,
          bio: 1,
          profileImage: 1,
          isOnBreak: 1,
          breakMessage: 1
        }
      },
    ]);

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
    });
  }
});


// Public: Return only one approved doctor per unique specialization
router.get("/specialties/unique", async (req, res) => {
  try {
    const doctors = await Doctor.aggregate([
      {
        $match: {
          isActive: true,
          verificationStatus: "approved",
          isVerified: true,
          specialization: {
            $type: "string",
            $ne: "",
          },
        },
      },

      // Latest approved doctor is selected for each specialization
      {
        $sort: {
          createdAt: -1,
        },
      },

      // Ignore capitalization and extra spaces
      {
        $group: {
          _id: {
            $toLower: {
              $trim: {
                input: "$specialization",
              },
            },
          },
          doctor: {
            $first: "$$ROOT",
          },
        },
      },

      {
        $project: {
          _id: "$doctor._id",
          name: "$doctor.name",
          specialization: "$doctor.specialization",
          qualification: "$doctor.qualification",
          experienceYears: "$doctor.experienceYears",
          profileImage: "$doctor.profileImage",
        },
      },

      {
        $sort: {
          specialization: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });

  } catch (error) {
    console.error("Unique specialties error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch specialties.",
    });
  }
});




// Public: list approved and active doctors.
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find({
      isActive: true,
      verificationStatus: "approved",
      isVerified: true,
    })
      .select(
        "name specialization qualification experienceYears consultationFee address city bio profileImage isOnBreak breakMessage"
      )
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Fetch doctors error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors.",
    });
  }
});

// Admin: list approved doctors only.
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const doctors = await Doctor.find({
      verificationStatus: "approved",
      isVerified: true,
      isActive: true,
    })
      .select(
        "user name specialization qualification experienceYears consultationFee address city bio profileImage medicalRegistrationNumber degreeCertificate registrationCertificate verificationStatus isVerified referralCode createdAt updatedAt"
      )
      .populate("user", "name email phone role createdAt")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Fetch approved doctors error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch approved doctors.",
    });
  }
});

// Admin: full doctor profile, patients, appointments and chat history.
router.get(
  "/admin/:id/details",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid doctor ID.",
        });
      }

      const doctor = await Doctor.findOne({
        _id: id,
        verificationStatus: "approved",
        isVerified: true,
        isActive: true,
      })
        .select(
          "user name specialization qualification experienceYears consultationFee address city bio profileImage degreeCertificate registrationCertificate medicalRegistrationNumber verificationStatus referralCode createdAt updatedAt"
        )
        .populate("user", "name email phone role createdAt");

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Approved doctor not found.",
        });
      }

      const appointments = await Appointment.find({
        doctor: doctor._id,
      })
        .populate("patient", "name email phone role createdAt")
        .sort({ appointmentAt: -1 })
        .lean();

      const appointmentIds = appointments.map(
        (appointment) => appointment._id
      );

      const messages = appointmentIds.length
        ? await ChatMessage.find({
          appointment: { $in: appointmentIds },
        })
          .populate("sender", "name role")
          .sort({ createdAt: 1 })
          .lean()
        : [];

      const messagesByAppointment = new Map();

      for (const message of messages) {
        const key = String(message.appointment);

        if (!messagesByAppointment.has(key)) {
          messagesByAppointment.set(key, []);
        }

        messagesByAppointment.get(key).push(message);
      }

      const appointmentsWithMessages = appointments.map(
        (appointment) => ({
          ...appointment,
          messages:
            messagesByAppointment.get(
              String(appointment._id)
            ) || [],
        })
      );

      const patientIds = appointments
        .map(
          (appointment) =>
            appointment.patient?._id || appointment.patient
        )
        .filter(Boolean)
        .map((patientId) => String(patientId));

      return res.status(200).json({
        success: true,
        doctor,
        appointments: appointmentsWithMessages,
        patientCount: new Set(patientIds).size,
      });
    } catch (error) {
      console.error("Admin doctor details error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load doctor details.",
      });
    }
  }
);

// Admin: list pending doctor applications.
router.get("/admin/pending", protect, adminOnly, async (req, res) => {
  try {
    const doctors = await Doctor.find({
      verificationStatus: "pending",
    })
      .select(
        "user name specialization qualification experienceYears consultationFee address city bio profileImage degreeCertificate registrationCertificate medicalRegistrationNumber verificationStatus referralCode createdAt"
      )
      .populate("user", "name email phone role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Fetch pending doctors error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending doctors.",
    });
  }
});

// Admin: approve a pending doctor.
router.patch(
  "/admin/:id/approve",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid doctor ID.",
        });
      }

      const doctor = await Doctor.findOneAndUpdate(
        {
          _id: id,
          verificationStatus: "pending",
        },
        {
          $set: {
            verificationStatus: "approved",
            isVerified: true,
            isActive: true,
            rejectionReason: "",
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Pending doctor not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Doctor approved successfully.",
        doctor,
      });
    } catch (error) {
      console.error("Approve doctor error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to approve doctor.",
      });
    }
  }
);

// Admin: reject a pending doctor and delete their account and files.
router.patch(
  "/admin/:id/reject",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;

      const reason =
        typeof req.body?.reason === "string"
          ? req.body.reason.trim()
          : "";

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid doctor ID.",
        });
      }

      if (!reason || reason.length > 500) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide a rejection reason (maximum 500 characters).",
        });
      }

      // Rejection is allowed only for pending applications.
      const doctor = await Doctor.findOne({
        _id: id,
        verificationStatus: "pending",
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Pending doctor not found.",
        });
      }

      const user = await User.findOne({
        _id: doctor.user,
        role: "doctor",
      }).select("_id");

      if (!user) {
        return res.status(409).json({
          success: false,
          message:
            "Linked doctor account was not found. No data was deleted.",
        });
      }

      await Doctor.deleteOne({ _id: doctor._id });
      await User.deleteOne({
        _id: user._id,
        role: "doctor",
      });

      await removeDoctorFiles(doctor);

      return res.status(200).json({
        success: true,
        message:
          "Doctor application rejected and deleted successfully.",
      });
    } catch (error) {
      console.error("Reject doctor error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to reject doctor.",
      });
    }
  }
);

// Admin: view a pending or approved doctor's certificate.

// Admin: securely view a pending or approved doctor's certificate.
router.get(
  "/admin/:id/certificate/:type",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { id, type } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid doctor ID.",
        });
      }

      const certificateFields = {
        degree: {
          publicId: "degreeCertificatePublicId",
          format: "degreeCertificateFormat",
        },
        registration: {
          publicId: "registrationCertificatePublicId",
          format: "registrationCertificateFormat",
        },
      };

      const selected = certificateFields[type];

      if (!selected) {
        return res.status(400).json({
          success: false,
          message: "Invalid certificate type.",
        });
      }

      const doctor = await Doctor.findOne({
        _id: id,
        verificationStatus: { $in: ["pending", "approved"] },
      }).select(
        `${selected.publicId} ${selected.format}`
      );

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found.",
        });
      }

      const publicId = doctor[selected.publicId];
      const format = doctor[selected.format];

      if (!publicId || !format) {
        return res.status(404).json({
          success: false,
          message: "Certificate not found.",
        });
      }

      const cloudinary = require("../config/cloudinary");

      const signedUrl = cloudinary.utils.private_download_url(
        publicId,
        format,
        {
          resource_type: "image",
          type: "authenticated",
          expires_at: Math.floor(Date.now() / 1000) + 300,
        }
      );

      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("X-Content-Type-Options", "nosniff");

      return res.status(200).json({
        success: true,
        certificateUrl: signedUrl,
      });
    } catch (error) {
      console.error("Certificate viewing error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to generate certificate link.",
      });
    }
  }
);

// Admin: permanently delete a doctor and related records.
router.delete("/admin/:id", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID.",
      });
    }

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    const appointments = await Appointment.find({
      doctor: doctor._id,
    })
      .select("_id")
      .lean();

    const appointmentIds = appointments.map(
      (appointment) => appointment._id
    );

    if (appointmentIds.length) {
      await ChatMessage.deleteMany({
        appointment: { $in: appointmentIds },
      });

      await Appointment.deleteMany({
        _id: { $in: appointmentIds },
      });
    }

    await Doctor.deleteOne({ _id: doctor._id });

    if (doctor.user) {
      await User.deleteOne({
        _id: doctor.user,
        role: "doctor",
      });
    }

    await removeDoctorFiles(doctor);

    return res.status(200).json({
      success: true,
      message: "Doctor and related records deleted successfully.",
    });
  } catch (error) {
    console.error("Delete doctor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete doctor.",
    });
  }
});

// Doctor settings: toggle automatic appointment confirmation.
router.patch("/settings/auto-confirm", protect, async (req, res) => {
  try {
    if (req.user.role !== "doctor" || typeof req.body?.isAutoConfirm !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "A doctor account and boolean isAutoConfirm value are required.",
      });
    }

    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id, verificationStatus: "approved", isVerified: true, isActive: true },
      { $set: { isAutoConfirm: req.body.isAutoConfirm } },
      { new: true, runValidators: true }
    ).select("isAutoConfirm");

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found." });
    }

    return res.json({ success: true, isAutoConfirm: doctor.isAutoConfirm });
  } catch (error) {
    console.error("Auto-confirm setting error:", error);
    return res.status(500).json({ success: false, message: "Could not update auto-approve setting." });
  }
});

// Doctor settings: toggle break mode and optionally update its message.
router.patch("/settings/break", protect, async (req, res) => {
  try {
    if (req.user.role !== "doctor" || typeof req.body?.isOnBreak !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "A doctor account and boolean isOnBreak value are required.",
      });
    }

    const update = { isOnBreak: req.body.isOnBreak };
    if (typeof req.body.breakMessage === "string") {
      const message = req.body.breakMessage.trim();
      if (message.length > 240) {
        return res.status(400).json({ success: false, message: "Break message must be 240 characters or fewer." });
      }
      update.breakMessage = message || "Doctor is currently on a short break";
    }

    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id, verificationStatus: "approved", isVerified: true, isActive: true },
      { $set: update },
      { new: true, runValidators: true }
    ).select("isOnBreak breakMessage");

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found." });
    }

    return res.json({ success: true, isOnBreak: doctor.isOnBreak, breakMessage: doctor.breakMessage });
  } catch (error) {
    console.error("Doctor break setting error:", error);
    return res.status(500).json({ success: false, message: "Could not update break mode." });
  }
});

// Public: get one approved doctor.
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID.",
      });
    }

    const doctor = await Doctor.findOne({
      _id: id,
      isActive: true,
      verificationStatus: "approved",
      isVerified: true,
    }).select(
      "name specialization qualification experienceYears consultationFee city address bio profileImage isOnBreak breakMessage"
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Approved doctor not found.",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("Fetch doctor details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor details.",
    });
  }
});

module.exports = router;

