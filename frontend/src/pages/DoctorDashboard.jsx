


import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./DoctorDashboard.css";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const menuItems = [
  { id: "profile", icon: "◉", label: "View Profile" },
  { id: "patients", icon: "♙", label: "Total Patients" },
  { id: "requests", icon: "◷", label: "Patient Requests" },
  { id: "patient-chat", icon: "✉", label: "Patient Chat" },
  { id: "appointments", icon: "▦", label: "Appointments" },
];

function formatDate(date) {
  if (!date) return "Not available";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Detail({ label, value }) {
  return (
    <div className="dd-detail-item">
      <span>{label}</span>
      <strong>{value || "Not provided"}</strong>
    </div>
  );
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activeView, setActiveView] = useState("profile");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [chatPatients, setChatPatients] = useState([]);
  const [chatInboxLoading, setChatInboxLoading] = useState(false);
  const [chatInboxError, setChatInboxError] = useState("");
  const [unreadPatients, setUnreadPatients] = useState(0);

  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [appointmentError, setAppointmentError] = useState("");
  const [notice, setNotice] = useState("");
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInSaving, setWalkInSaving] = useState(false);

  const token = localStorage.getItem("token") || "";

  const loadAppointments = useCallback(async () => {
    const savedToken = localStorage.getItem("token");

    if (!savedToken) {
      setAppointmentsLoading(false);
      return;
    }

    try {
      setAppointmentsLoading(true);

      const response = await fetch(`${API_BASE}/appointments/mine`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Appointments load nahi hui."
        );
      }

      setAppointments(
        Array.isArray(result.appointments)
          ? result.appointments
          : []
      );

      setAppointmentError("");
    } catch (err) {
      setAppointmentError(
        err.message || "Appointments load nahi hui."
      );
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  const loadChatInbox = useCallback(async () => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) return;

    try {
      setChatInboxLoading(true);

      const response = await fetch(`${API_BASE}/chat/inbox`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Patient chat list load nahi hui."
        );
      }

      setChatPatients(
        Array.isArray(result.patients) ? result.patients : []
      );

      setUnreadPatients(Number(result.unreadPatients) || 0);
      setChatInboxError("");
    } catch (err) {
      setChatInboxError(
        err.message || "Patient chat list load nahi hui."
      );
    } finally {
      setChatInboxLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const savedToken = localStorage.getItem("token");

      if (!savedToken) {
        navigate("/login/doctor");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/doctor/profile`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Profile load nahi hui."
          );
        }

        if (!cancelled) {
          setDoctor(result.doctor);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Kuch galat ho gaya.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();
    loadAppointments();
    loadChatInbox();

    const intervalId = setInterval(() => {
      loadAppointments();
      loadChatInbox();
    }, 10000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [navigate, loadAppointments, loadChatInbox]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setSelectedPatient(null);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function updateAppointment(
    appointmentId,
    status,
    consultationMode = null
  ) {
    setUpdatingId(appointmentId);
    setAppointmentError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE}/appointments/${appointmentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            consultationMode,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Appointment update nahi hui."
        );
      }

      setNotice(
        status === "confirmed"
          ? `Appointment ${consultationMode === "online"
            ? "Online Consultation"
            : "Clinic Visit"
          } ke liye accept ho gayi.`
          : "Appointment cancel ho gayi."
      );

      await loadAppointments();
    } catch (err) {
      setAppointmentError(
        err.message || "Appointment update nahi hui."
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function toggleDoctorSetting(setting, value) {
    const endpoint = setting === "isAutoConfirm"
      ? `${API_BASE}/doctors/settings/auto-confirm`
      : `${API_BASE}/doctors/settings/break`;
    const body = setting === "isAutoConfirm"
      ? { isAutoConfirm: value }
      : { isOnBreak: value };

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Setting update failed.");
      setDoctor((current) => ({ ...current, ...result }));
      setNotice(setting === "isAutoConfirm"
        ? `Auto-Approve Bookings ${value ? "ON" : "OFF"}`
        : `Doctor Break ${value ? "ON" : "OFF"}`);
    } catch (err) {
      setAppointmentError(err.message || "Setting update failed.");
    }
  }

  async function addWalkInPatient(event) {
    event.preventDefault();
    if (!walkInName.trim() || !walkInPhone.trim()) return;
    setWalkInSaving(true);
    setAppointmentError("");
    try {
      const response = await fetch(`${API_BASE}/appointments/walk-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patientName: walkInName.trim(), patientPhone: walkInPhone.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Walk-in patient could not be added.");
      setWalkInName("");
      setWalkInPhone("");
      setShowWalkInModal(false);
      setNotice("Walk-in patient added to the appointment queue.");
      await loadAppointments();
    } catch (err) {
      setAppointmentError(err.message || "Walk-in patient could not be added.");
    } finally {
      setWalkInSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  // const profileImage = doctor?.profileImage
  //   ? doctor.profileImage.startsWith("/uploads/")
  //     ? `http://localhost:5000${doctor.profileImage}`
  //     : doctor.profileImage
  //   : "";

  const profileImage = doctor?.profileImage
    ? doctor.profileImage.startsWith("/uploads/")
      ? `${import.meta.env.VITE_API_URL}${doctor.profileImage}`
      : doctor.profileImage
    : "";

  const patients = useMemo(() => {
    const uniquePatients = new Map();

    appointments.forEach((appointment) => {
      const patient = appointment.patient;

      if (patient?._id) {
        const existing = uniquePatients.get(patient._id);

        uniquePatients.set(patient._id, {
          ...patient,
          firstAppointmentDate:
            existing?.firstAppointmentDate ||
            appointment.createdAt ||
            appointment.appointmentAt ||
            null,
          appointmentCount:
            (existing?.appointmentCount || 0) + 1,
        });
      }
    });

    return Array.from(uniquePatients.values());
  }, [appointments]);

  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "pending"
  );

  const confirmedAppointments = appointments.filter(
    (appointment) => appointment.status === "confirmed"
  );

  const todayAppointments = appointments.filter((appointment) => {
    const date = new Date(appointment.appointmentAt || appointment.createdAt);
    const now = new Date();
    return !Number.isNaN(date.getTime()) &&
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate() &&
      ["confirmed", "completed"].includes(appointment.status);
  });
  const todayPatientCount = todayAppointments.length;
  const todayEstimatedRevenue = todayPatientCount * Number(doctor?.consultationFee || 0);

  if (loading) {
    return (
      <div className="doctor-dashboard-message">
        Loading doctor dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-dashboard-message">
        <p>{error}</p>
        <button onClick={handleLogout}>Back to Login</button>
      </div>
    );
  }

  if (!doctor) return null;

  function getPatientName(appointment) {
    return appointment.patient?.name || appointment.patientName || "Patient";
  }

  function getConsultationPreference(preference) {
    if (preference === "both") return "Online + Clinic";
    if (preference === "online") return "Online Consultation";
    if (preference === "clinic") return "Clinic Visit";
    return "Not specified";
  }

  function getConsultationMode(mode) {
    if (mode === "online") return "Online Consultation";
    if (mode === "clinic") return "Clinic Visit";
    return "";
  }

  function renderAppointments(list) {
    if (appointmentsLoading) {
      return (
        <div className="dd-empty">
          Appointments load ho rahi hain...
        </div>
      );
    }

    if (list.length === 0) {
      return (
        <div className="dd-empty">
          <div className="dd-empty-icon">▦</div>
          <h3>Koi appointment nahi hai</h3>
          <p>
            Jab patient appointment request bhejega,
            uski details yahan dikhengi.
          </p>
        </div>
      );
    }

    return (
      <div className="dd-appointment-list">
        {list.map((appointment) => (
          <article
            className="dd-appointment-card"
            key={appointment._id}
          >
            <div className="dd-patient-avatar">
              {getPatientName(appointment)
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="dd-appointment-info">
              <h3>{getPatientName(appointment)}</h3>

              <p>
                {appointment.patient?.email ||
                  "Email not available"}
              </p>

              <p>
                {appointment.patient?.phone || appointment.patientPhone || "Phone not provided"}
              </p>

              <p>
                <strong>Date: </strong>
                {appointment.appointmentAt
                  ? formatDate(appointment.appointmentAt)
                  : "Not provided"}
              </p>

              {appointment.reason && (
                <p>
                  <strong>Reason: </strong>
                  {appointment.reason}
                </p>
              )}

              <div className="dd-consultation-info">
                <p>
                  <strong>Patient Preference:</strong>
                </p>

                <span className="dd-consultation-badge">
                  {getConsultationPreference(
                    appointment.consultationPreference
                  )}
                </span>

                <div className="dd-doctor-selection">
                  <strong>Doctor Selected:</strong>

                  {appointment.consultationMode ? (
                    <span className="dd-doctor-mode-badge">
                      {getConsultationMode(
                        appointment.consultationMode
                      )}
                    </span>
                  ) : appointment.status === "pending" ? (
                    <span className="dd-waiting-selection">
                      Waiting for your selection
                    </span>
                  ) : (
                    <span className="dd-waiting-selection">
                      Not selected
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="dd-appointment-actions">
              <span
                className={`dd-status ${appointment.status || "pending"
                  }`}
              >
                {appointment.status || "pending"}
              </span>

              {appointment.status === "confirmed" && (
                <Link
                  to={`/chat/${appointment._id}`}
                  className="dd-chat-button"
                >
                  Open Chat
                </Link>
              )}

              {appointment.status === "pending" && (
                <div className="dd-action-row">
                  {(appointment.consultationPreference === "online" ||
                    appointment.consultationPreference === "both") && (
                      <button
                        className="dd-confirm-button"
                        disabled={updatingId === appointment._id}
                        onClick={() =>
                          updateAppointment(
                            appointment._id,
                            "confirmed",
                            "online"
                          )
                        }
                      >
                        {updatingId === appointment._id
                          ? "Please wait..."
                          : "Accept Online"}
                      </button>
                    )}

                  {(appointment.consultationPreference === "clinic" ||
                    appointment.consultationPreference === "both") && (
                      <button
                        className="dd-confirm-button"
                        disabled={updatingId === appointment._id}
                        onClick={() =>
                          updateAppointment(
                            appointment._id,
                            "confirmed",
                            "clinic"
                          )
                        }
                      >
                        {updatingId === appointment._id
                          ? "Please wait..."
                          : "Accept Clinic"}
                      </button>
                    )}

                  <button
                    className="dd-cancel-button"
                    disabled={updatingId === appointment._id}
                    onClick={() =>
                      updateAppointment(
                        appointment._id,
                        "cancelled"
                      )
                    }
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <main className="dd-layout">
      <aside className="dd-sidebar">
        <Link to="/doctor/dashboard" className="dd-brand">
          <img src="/image/logo.png" alt="MedQueue Logo" className="brand-logo" style={{ width: "38px", height: "38px" }} />
          <span>MedQueue</span>
        </Link>

        <div className="dd-sidebar-doctor">
          {profileImage ? (
            <img src={profileImage} alt={doctor.name} />
          ) : (
            <div className="dd-avatar-placeholder">
              {doctor.name?.charAt(0) || "D"}
            </div>
          )}

          <div>
            <strong>Dr. {doctor.name}</strong>
            <span>{doctor.specialization}</span>
          </div>
        </div>

        <p className="dd-nav-heading">DASHBOARD</p>

        <nav className="dd-nav">
          {menuItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`dd-nav-item ${activeView === item.id ? "active" : ""
                }`}
              onClick={() => {
                setActiveView(item.id);
                setNotice("");
                setAppointmentError("");
              }}
            >
              <span className="dd-nav-icon">{item.icon}</span>
              <span>{item.label}</span>

              {item.id === "requests" &&
                pendingAppointments.length > 0 && (
                  <span className="dd-nav-count">
                    {pendingAppointments.length}
                  </span>
                )}

              {item.id === "patient-chat" &&
                unreadPatients > 0 && (
                  <span className="dd-nav-count dd-unread-count">
                    {unreadPatients}
                  </span>
                )}
            </button>
          ))}
        </nav>

        <div className="dd-sidebar-bottom">
          <div className="dd-sidebar-security">
            <span>✓</span>
            <div>
              <strong>Secure Dashboard</strong>
              <small>Your profile is private</small>
            </div>
          </div>

          <button
            className="dd-logout-button"
            onClick={handleLogout}
          >
            ↪ Logout
          </button>
        </div>
      </aside>

      <section className="dd-main">
        <header className="dd-topbar">
          <div>
            <p className="dd-breadcrumb">
              Dashboard /{" "}
              {menuItems.find((item) => item.id === activeView)?.label}
            </p>

            <h1>
              {activeView === "profile" && "My Profile"}
              {activeView === "patients" && "Total Patients"}
              {activeView === "requests" && "Patient Requests"}
              {activeView === "patient-chat" && "Patient Chat"}
              {activeView === "appointments" && "Appointments"}
            </h1>

            <p>
              Welcome back, Dr. {doctor.name}. Manage your practice here.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button type="button" className="dd-refresh-button"
              onClick={() => toggleDoctorSetting("isAutoConfirm", !doctor.isAutoConfirm)}>
              Auto-Approve Bookings: {doctor.isAutoConfirm ? "ON" : "OFF"}
            </button>
            <button type="button" className="dd-refresh-button"
              onClick={() => toggleDoctorSetting("isOnBreak", !doctor.isOnBreak)}>
              Doctor Break: {doctor.isOnBreak ? "ON" : "OFF"}
            </button>
            <button type="button" className="dd-refresh-button" onClick={() => setShowWalkInModal(true)}>
              + Add Walk-in Patient
            </button>
            <button className="dd-refresh-button"
              onClick={() => { loadAppointments(); loadChatInbox(); }}
              disabled={appointmentsLoading || chatInboxLoading}>
              ↻ Refresh
            </button>
          </div>
        </header>

        {notice && (
          <div className="dd-alert success">{notice}</div>
        )}

        {appointmentError && (
          <div className="dd-alert error">
            {appointmentError}
          </div>
        )}

        {activeView === "profile" && (
          <>
            <section className="dd-welcome-card">
              <div className="dd-profile-cover">
                {profileImage ? (
                  <img src={profileImage} alt={doctor.name} />
                ) : (
                  <div className="dd-large-avatar">
                    {doctor.name?.charAt(0) || "D"}
                  </div>
                )}
              </div>

              <div className="dd-welcome-info">
                <span className="dd-eyebrow">
                  PROFESSIONAL PROFILE
                </span>
                <h2>Dr. {doctor.name}</h2>
                <p>{doctor.specialization}</p>
                <span
                  className={`dd-status ${doctor.verificationStatus || "pending"
                    }`}
                >
                  {doctor.verificationStatus || "pending"}
                </span>
              </div>
            </section>

            <section className="dd-stat-grid">
              <article className="dd-stat-card">
                <span className="dd-stat-icon">♙</span>
                <div>
                  <p>Total Patients</p>
                  <h3>{patients.length}</h3>
                </div>
              </article>

              <article className="dd-stat-card">
                <span className="dd-stat-icon amber">◷</span>
                <div>
                  <p>New Requests</p>
                  <h3>{pendingAppointments.length}</h3>
                </div>
              </article>

              <article className="dd-stat-card">
                <span className="dd-stat-icon blue">✓</span>
                <div>
                  <p>Confirmed Appointments</p>
                  <h3>{confirmedAppointments.length}</h3>
                </div>
              </article>
              <article className="dd-stat-card">
                <span className="dd-stat-icon">♙</span>
                <div>
                  <p>Today's Total Patients</p>
                  <h3>{todayPatientCount}</h3>
                </div>
              </article>
              <article className="dd-stat-card">
                <span className="dd-stat-icon blue">₹</span>
                <div>
                  <p>Today's Estimated Revenue</p>
                  <h3>₹{todayEstimatedRevenue.toLocaleString("en-IN")}</h3>
                </div>
              </article>
            </section>

            <section className="dd-panel">
              <div className="dd-panel-heading">
                <div>
                  <h2>Personal & Professional Details</h2>
                  <p>Your registered information</p>
                </div>
                <span className="dd-detail-icon">✦</span>
              </div>

              <div className="dd-details-grid">
                <Detail label="Full Name" value={`Dr. ${doctor.name}`} />
                <Detail label="Email Address" value={doctor.email} />
                <Detail label="Phone Number" value={doctor.phone} />
                <Detail label="Specialization" value={doctor.specialization} />
                <Detail label="Qualification" value={doctor.qualification} />
                <Detail
                  label="Experience"
                  value={
                    doctor.experienceYears != null
                      ? `${doctor.experienceYears} years`
                      : ""
                  }
                />
                <Detail
                  label="Medical Registration No."
                  value={doctor.medicalRegistrationNumber}
                />
                <Detail label="Clinic Address" value={doctor.address} />
                <Detail
                  label="Consultation Fee"
                  value={
                    doctor.consultationFee != null
                      ? `₹${doctor.consultationFee}`
                      : ""
                  }
                />
              </div>
            </section>

            <section className="dd-panel">
              <div className="dd-panel-heading">
                <div>
                  <h2>Recent Patient Requests</h2>
                  <p>Latest appointment requests from patients</p>
                </div>

                <button
                  className="dd-text-button"
                  onClick={() => setActiveView("requests")}
                >
                  View all →
                </button>
              </div>

              {renderAppointments(
                pendingAppointments.slice(0, 3)
              )}
            </section>
          </>
        )}

        {activeView === "patients" && (
          <>
            <section className="dd-stat-grid single-stat">
              <article className="dd-stat-card">
                <span className="dd-stat-icon">♙</span>
                <div>
                  <p>Total Unique Patients</p>
                  <h3>{patients.length}</h3>
                </div>
              </article>
            </section>

            <section className="dd-panel">
              <div className="dd-panel-heading">
                <div>
                  <h2>Your Patients</h2>
                  <p>
                    Patients who have appointments with you
                  </p>
                </div>
              </div>

              {appointmentsLoading ? (
                <div className="dd-empty">Loading patients...</div>
              ) : patients.length === 0 ? (
                <div className="dd-empty">
                  <div className="dd-empty-icon">♙</div>
                  <h3>No patients yet</h3>
                  <p>
                    Patients will appear here after they book an appointment.
                  </p>
                </div>
              ) : (
                <div className="dd-patient-grid">
                  {patients.map((patient) => {
                    const patientAppointments = appointments.filter(
                      (appointment) =>
                        appointment.patient?._id === patient._id
                    );

                    return (
                      <article
                        className="dd-patient-card"
                        key={patient._id}
                      >
                        <div className="dd-patient-avatar large">
                          {patient.name?.charAt(0)?.toUpperCase() || "P"}
                        </div>

                        <h3>{patient.name || "Patient"}</h3>
                        <p>{patient.email || "Email not available"}</p>
                        <p>{patient.phone || "Phone not provided"}</p>

                        <span className="dd-patient-meta">
                          {patientAppointments.length} appointment(s)
                        </span>

                        <button
                          type="button"
                          className="dd-view-button"
                          onClick={() =>
                            setSelectedPatient({
                              ...patient,
                              appointments: patientAppointments,
                            })
                          }
                        >
                          View Details
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {activeView === "requests" && (
          <section className="dd-panel">
            <div className="dd-panel-heading">
              <div>
                <h2>New Patient Requests</h2>
                <p>
                  Confirm or cancel pending appointment requests.
                </p>
              </div>

              <span className="dd-count-badge">
                {pendingAppointments.length} pending
              </span>
            </div>

            {renderAppointments(pendingAppointments)}
          </section>
        )}

        {activeView === "patient-chat" && (
          <section className="dd-panel">
            <div className="dd-panel-heading">
              <div>
                <h2>Patient Chat</h2>
                <p>
                  Confirmed appointment wale patients ke saath secure chat.
                </p>
              </div>

              <button
                className="dd-refresh-button"
                onClick={loadChatInbox}
                disabled={chatInboxLoading}
              >
                {chatInboxLoading ? "Loading..." : "↻ Refresh chats"}
              </button>
            </div>

            {chatInboxError && (
              <p className="dd-chat-error">{chatInboxError}</p>
            )}

            {chatInboxLoading && chatPatients.length === 0 ? (
              <div className="dd-empty">
                Patient chats load ho rahi hain...
              </div>
            ) : chatPatients.length === 0 ? (
              <div className="dd-empty">
                <div className="dd-empty-icon">✉</div>
                <h3>Abhi koi patient chat nahi hai</h3>
                <p>
                  Confirmed appointments wale patients yahan dikhai denge.
                </p>
              </div>
            ) : (
              <div className="dd-chat-patient-list">
                {chatPatients.map((row) => {
                  const patient = row.patient || {};
                  const appointment = row.appointments?.[0];

                  return (
                    <article
                      className="dd-chat-patient-card"
                      key={patient._id}
                    >
                      <div className="dd-patient-avatar">
                        {patient.name?.charAt(0)?.toUpperCase() || "P"}
                      </div>

                      <div className="dd-chat-patient-info">
                        <h3>{patient.name || "Patient"}</h3>
                        <p>{patient.email || "Email not available"}</p>
                        <span>
                          {row.lastMessage || "No messages yet"}
                        </span>
                      </div>

                      {row.unreadCount > 0 && (
                        <span
                          className="dd-chat-unread-badge"
                          title={`${row.unreadCount} unread messages`}
                        >
                          {row.unreadCount}
                        </span>
                      )}

                      <button
                        type="button"
                        className="dd-view-button"
                        disabled={!appointment?._id}
                        onClick={() => {
                          loadChatInbox();
                          navigate(`/chat/${appointment._id}`);
                        }}
                      >
                        View Chat
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeView === "appointments" && (
          <section className="dd-panel">
            <div className="dd-panel-heading">
              <div>
                <h2>All Appointments</h2>
                <p>
                  Review pending, confirmed and cancelled appointments.
                </p>
              </div>

              <span className="dd-count-badge">
                {appointments.length} total
              </span>
            </div>

            {renderAppointments(appointments)}
          </section>
        )}
      </section>

      {selectedPatient && (
        <PatientDetailsModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}

      {showWalkInModal && (
        <div className="dd-modal-overlay" onClick={() => setShowWalkInModal(false)}>
          <section className="dd-patient-modal" role="dialog" aria-modal="true" aria-label="Add walk-in patient" onClick={(event) => event.stopPropagation()}>
            <header className="dd-modal-header">
              <div>
                <span className="dd-eyebrow">OFFLINE REGISTRATION</span>
                <h2>Add Walk-in Patient</h2>
              </div>
              <button type="button" className="dd-modal-close" onClick={() => setShowWalkInModal(false)} aria-label="Close">×</button>
            </header>
            <form onSubmit={addWalkInPatient}>
              <div className="dd-modal-body">
                <label className="dd-detail-item">
                  <span>Patient Name</span>
                  <input value={walkInName} onChange={(event) => setWalkInName(event.target.value)} maxLength={100} required placeholder="Enter patient name" />
                </label>
                <label className="dd-detail-item" style={{ marginTop: "16px" }}>
                  <span>Phone Number</span>
                  <input value={walkInPhone} onChange={(event) => setWalkInPhone(event.target.value)} maxLength={20} required placeholder="Enter patient phone" />
                </label>
                <p style={{ color: "var(--dd-muted)", fontSize: "12px", marginTop: "14px" }}>
                  Today's date and current time will be added automatically. Consultation: Clinic · Status: Confirmed.
                </p>
              </div>
              <footer className="dd-modal-footer">
                <button type="button" className="dd-refresh-button" onClick={() => setShowWalkInModal(false)}>Cancel</button>
                <button type="submit" className="dd-confirm-button" disabled={walkInSaving}>
                  {walkInSaving ? "Adding..." : "Add Patient"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

function PatientDetailsModal({ patient, onClose }) {
  const appointments = patient.appointments || [];

  const joinDateValue =
    patient.firstAppointmentDate ||
    appointments
      .map((appointment) => appointment.createdAt || appointment.appointmentAt)
      .filter(Boolean)
      .sort((a, b) => new Date(a) - new Date(b))[0];

  const joinDate = joinDateValue ? new Date(joinDateValue) : null;

  const calendarDates = useMemo(() => {
    if (!joinDate || Number.isNaN(joinDate.getTime())) {
      return [];
    }

    const start = new Date(joinDate);
    start.setDate(start.getDate() - 5);

    return Array.from({ length: 35 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);

      return {
        date,
        isJoinDay: date.toDateString() === joinDate.toDateString(),
        isAfterJoin: date > joinDate,
      };
    });
  }, [joinDateValue]);

  const [monthOffset, setMonthOffset] = useState(0);

  const calendarMonth = useMemo(() => {
    if (!joinDate) return new Date();

    const date = new Date(joinDate);
    date.setMonth(date.getMonth() + monthOffset);
    return date;
  }, [joinDateValue, monthOffset]);

  const firstDay = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
    1
  ).getDay();

  const daysInMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
    0
  ).getDate();

  const chatCount = appointments.reduce(
    (count, appointment) =>
      count +
      (Array.isArray(appointment.messages)
        ? appointment.messages.length
        : 0),
    0
  );

  const videoCallCount = appointments.filter(
    (appointment) =>
      appointment.videoCallStatus === "accepted"
  ).length;

  function isTrackedDate(date) {
    return calendarDates.some(
      (item) => item.date.toDateString() === date.toDateString()
    );
  }

  function isRedDate(date) {
    return calendarDates.some(
      (item) =>
        item.date.toDateString() === date.toDateString() &&
        (item.isJoinDay || item.isAfterJoin)
    );
  }

  return (
    <div
      className="dd-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="dd-patient-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dd-modal-title"
      >
        <header className="dd-modal-header">
          <div>
            <span className="dd-eyebrow">PATIENT INFORMATION</span>
            <h2 id="dd-modal-title">Patient Details</h2>
          </div>

          <button
            type="button"
            className="dd-modal-close"
            onClick={onClose}
            aria-label="Close patient details"
          >
            ×
          </button>
        </header>

        <div className="dd-modal-body">
          <section className="dd-modal-profile">
            <div className="dd-patient-avatar dd-modal-avatar">
              {patient.name?.charAt(0)?.toUpperCase() || "P"}
            </div>

            <div className="dd-modal-patient-info">
              <h3>{patient.name || "Patient"}</h3>
              <p>{patient.email || "Email not provided"}</p>
              <p>{patient.phone || "Phone not provided"}</p>
            </div>
          </section>

          <section className="dd-modal-stats">
            <article>
              <span>Appointments</span>
              <strong>{appointments.length}</strong>
            </article>

            <article>
              <span>Chat messages</span>
              <strong>{chatCount}</strong>
            </article>

            <article>
              <span>Accepted video calls</span>
              <strong>{videoCallCount}</strong>
            </article>
          </section>

          <section className="dd-modal-section">
            <h3>Patient Joining Date</h3>
            <p className="dd-join-date">
              {joinDate ? formatDate(joinDate) : "Join date not available"}
            </p>
            <p className="dd-modal-note">
              Available appointment creation date ko joining-date estimate
              ke roop mein use kiya gaya hai. Exact joining date ke liye
              backend mein dedicated date field chahiye.
            </p>
          </section>

          <section className="dd-modal-section">
            <div className="dd-calendar-heading">
              <div>
                <h3>Patient Relationship Calendar</h3>
                <p>Join date se 5 din pehle aur 30 din baad tak.</p>
              </div>

              <div className="dd-calendar-controls">
                <button
                  type="button"
                  onClick={() => setMonthOffset((value) => value - 1)}
                  aria-label="Previous month"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={() => setMonthOffset((value) => value + 1)}
                  aria-label="Next month"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="dd-calendar">
              <h4>
                {calendarMonth.toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </h4>

              <div className="dd-calendar-grid">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div className="dd-calendar-weekday" key={day}>
                      {day}
                    </div>
                  )
                )}

                {Array.from({ length: firstDay }, (_, index) => (
                  <div
                    className="dd-calendar-day empty"
                    key={`empty-${index}`}
                  />
                ))}

                {Array.from({ length: daysInMonth }, (_, index) => {
                  const date = new Date(
                    calendarMonth.getFullYear(),
                    calendarMonth.getMonth(),
                    index + 1
                  );

                  const tracked = isTrackedDate(date);
                  const red = isRedDate(date);

                  return (
                    <div
                      key={date.toISOString()}
                      className={[
                        "dd-calendar-day",
                        tracked ? "tracked" : "",
                        red ? "red" : "",
                        joinDate &&
                          date.toDateString() === joinDate.toDateString()
                          ? "join-day"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      title={
                        joinDate &&
                          date.toDateString() === joinDate.toDateString()
                          ? "Patient joining date"
                          : tracked
                            ? "Patient tracking period"
                            : ""
                      }
                    >
                      {index + 1}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="dd-calendar-legend">
              <span>
                <i className="legend-red" /> Join date aur uske baad
              </span>
              <span>
                <i className="legend-period" /> Tracking period
              </span>
            </div>
          </section>
        </div>

        <footer className="dd-modal-footer">
          <button
            type="button"
            className="dd-modal-done"
            onClick={onClose}
          >
            Close Details
          </button>
        </footer>
      </section>
    </div>
  );
}


