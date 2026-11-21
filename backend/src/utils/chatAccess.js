const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

async function getConfirmedAppointmentForUser(appointmentId, user) {
  if (!user || !["patient", "doctor"].includes(user.role)) return null;

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    status: "confirmed",
  });

  if (!appointment) return null;

  if (user.role === "patient") {
    return String(appointment.patient) === String(user._id) ? appointment : null;
  }

  const doctor = await Doctor.findOne({
    user: user._id,
    verificationStatus: "approved",
    isVerified: true,
    isActive: true,
  }).select("_id");

  if (!doctor || String(appointment.doctor) !== String(doctor._id)) return null;
  return appointment;
}

module.exports = { getConfirmedAppointmentForUser };
