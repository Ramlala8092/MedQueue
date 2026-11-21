const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");

const ChatMessage = require("../models/ChatMessage");
// const { protect } = require("../middleware/authMiddleware");
const {  protect, adminOnly,} = require("../middleware/authMiddleware");
const { getConfirmedAppointmentForUser } = require("../utils/chatAccess");

const router = express.Router();

function isPatientChatWindowExpired(appointment) {
  const start = new Date(appointment.appointmentAt || appointment.createdAt);
  if (Number.isNaN(start.getTime())) return false;
  return Date.now() >= start.getTime() + 48 * 60 * 60 * 1000;
}

const privateUploadDir = path.join(__dirname, "../../private-chat-uploads");
fs.mkdirSync(privateUploadDir, { recursive: true });

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, privateUploadDir),
  filename: (_req, file, callback) => {
    const extension = file.mimetype === "image/png"
      ? ".png"
      : file.mimetype === "image/webp"
        ? ".webp"
        : ".jpg";
    callback(null, `${Date.now()}-${require("crypto").randomBytes(16).toString("hex")}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error("Sirf JPG, PNG ya WEBP image upload kar sakte hain.");
      error.status = 400;
      return callback(error);
    }
    callback(null, true);
  },
});

async function requireAppointmentAccess(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.appointmentId)) {
      return res.status(400).json({ success: false, message: "Invalid appointment ID." });
    }

    const appointment = await getConfirmedAppointmentForUser(
      req.params.appointmentId,
      req.user
    );

    if (!appointment) {
      return res.status(403).json({
        success: false,
        message: "Chat sirf confirmed appointment ke patient aur doctor ke liye available hai.",
      });
    }

    req.chatAppointment = appointment;
    next();
  } catch (error) {
    next(error);
  }
}


// Doctor inbox: one row per patient, with unread count per patient.
router.get("/inbox", protect, async (req, res, next) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Doctor access only." });
    }
    const Doctor = require("../models/Doctor");
    const Appointment = require("../models/Appointment");
    const doctor = await Doctor.findOne({ user: req.user._id }).select("_id");
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found." });
    const appointments = await Appointment.find({ doctor: doctor._id, status: "confirmed" })
      .populate("patient", "name email phone")
      .sort({ updatedAt: -1 });
    const rows = new Map();
    for (const appointment of appointments) {
      if (!appointment.patient) continue;
      const patientId = String(appointment.patient._id);
      let row = rows.get(patientId);
      if (!row) {
        row = { patient: appointment.patient, appointments: [], unreadCount: 0, lastMessage: null, lastMessageAt: null };
        rows.set(patientId, row);
      }
      row.appointments.push({ _id: appointment._id, appointmentAt: appointment.appointmentAt, createdAt: appointment.createdAt, status: appointment.status });
    }
    for (const row of rows.values()) {
      const ids = row.appointments.map(a => a._id);
      const last = await ChatMessage.findOne({ appointment: { $in: ids } }).sort({ createdAt: -1 }).select("text imageFilename createdAt sender");
      if (last) { row.lastMessage = last.text || (last.imageFilename ? "Photo" : "Message"); row.lastMessageAt = last.createdAt; }
      row.unreadCount = await ChatMessage.countDocuments({ appointment: { $in: ids }, sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } });
    }
    const result = Array.from(rows.values()).sort((a,b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
    res.json({ success: true, patients: result, unreadPatients: result.filter(p => p.unreadCount > 0).length });
  } catch (error) { next(error); }
});

// Mark messages in one confirmed appointment as read by the current user.
router.post("/:appointmentId/read", protect, requireAppointmentAccess, async (req, res, next) => {
  try {
    await ChatMessage.updateMany(
      { appointment: req.chatAppointment._id, sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
    const io = req.app.get("io");
    if (io) io.to(`appointment:${String(req.chatAppointment._id)}`).emit("chat:read", { appointmentId: String(req.chatAppointment._id), readerId: String(req.user._id) });
    res.json({ success: true });
  } catch (error) { next(error); }
});

router.get("/:appointmentId/messages", protect, requireAppointmentAccess, async (req, res, next) => {
  try {
    await ChatMessage.updateMany(
      { appointment: req.chatAppointment._id, sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
    const messages = await ChatMessage.find({
      appointment: req.chatAppointment._id,
    })
      .populate("sender", "name role")
      .sort({ createdAt: 1 })
      .limit(500);

    res.json({
      success: true,
      messages,
      appointment: {
        _id: req.chatAppointment._id,
        appointmentAt: req.chatAppointment.appointmentAt,
        createdAt: req.chatAppointment.createdAt,
        status: req.chatAppointment.status,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:appointmentId/photo", protect, requireAppointmentAccess, (req, res, next) => {
  if (req.user.role === "patient" && isPatientChatWindowExpired(req.chatAppointment)) {
    return res.status(403).json({
      success: false,
      message: "This 48-hour follow-up chat window has ended. Please book a new appointment to consult again.",
    });
  }

  upload.single("photo")(req, res, async (uploadError) => {
    if (uploadError) {
      return res.status(uploadError.status || 400).json({
        success: false,
        message: uploadError.code === "LIMIT_FILE_SIZE"
          ? "Photo maximum 5 MB ki ho sakti hai."
          : uploadError.message || "Photo upload nahi hui.",
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "Photo select karein." });
      }

      const message = await ChatMessage.create({
        appointment: req.chatAppointment._id,
        sender: req.user._id,
        text: "",
        imageFilename: req.file.filename,
      });

      const populated = await message.populate("sender", "name role");
      const io = req.app.get("io");
      if (io) io.to(`appointment:${String(req.chatAppointment._id)}`).emit("chat:message", populated);

      res.status(201).json({ success: true, message: populated });
    } catch (error) {
      if (req.file) fs.promises.unlink(req.file.path).catch(() => {});
      next(error);
    }
  });
});

router.get("/messages/:messageId/photo", protect, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.messageId)) {
      return res.status(400).json({ success: false, message: "Invalid message ID." });
    }

    const message = await ChatMessage.findById(req.params.messageId);
    if (!message || !message.imageFilename) {
      return res.status(404).json({ success: false, message: "Photo nahi mili." });
    }

    const appointment = await getConfirmedAppointmentForUser(message.appointment, req.user);
    if (!appointment) {
      return res.status(403).json({ success: false, message: "Is photo ko dekhne ki permission nahi hai." });
    }

    const filePath = path.join(privateUploadDir, path.basename(message.imageFilename));
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Photo file nahi mili." });
    }

    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
