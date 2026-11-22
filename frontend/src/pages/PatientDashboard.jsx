
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./PatientDashboard.css";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

export default function PatientDashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    } catch {
      setUser(null);
    }

    async function loadAppointments() {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to view your appointments.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/appointments/mine`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load appointments.");
        }

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.appointments)
            ? data.appointments
            : Array.isArray(data.data)
              ? data.data
              : [];

        setAppointments(list);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, []);

  const pendingCount = appointments.filter(
    (item) => item.status === "pending"
  ).length;

  const confirmedCount = appointments.filter(
    (item) => item.status === "confirmed"
  ).length;

  const completedCount = appointments.filter(
    (item) => item.status === "completed"
  ).length;

  function formatDate(value) {
    if (!value) return "Not scheduled";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not scheduled";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(value) {
    if (!value) return "--";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "--";

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusClass(status) {
    const allowedStatuses = [
      "pending",
      "confirmed",
      "cancelled",
      "completed",
    ];

    return allowedStatuses.includes(status) ? status : "pending";
  }

  function getPreferenceLabel(preference) {
    switch (preference) {
      case "online":
        return "Online Consultation";
      case "clinic":
        return "Clinic Visit";
      case "both":
        return "Online + Clinic";
      default:
        return "Not specified";
    }
  }

  function getModeLabel(mode) {
    switch (mode) {
      case "online":
        return "Online Consultation";
      case "clinic":
        return "Clinic Visit";
      default:
        return "";
    }
  }

  return (
    <div className="patient-app">
      <aside className="patient-sidebar">
        <Link to="/" className="patient-brand">
          <span className="brand-symbol">M</span>
          <span>MedQueue</span>
        </Link>

        <p className="sidebar-label">PATIENT MENU</p>

        <Link to="/patient/dashboard" className="sidebar-link active">
          <span>▦</span> Dashboard
        </Link>

        <Link to="/" className="sidebar-link">
          <span>⌕</span> Find Doctors
        </Link>

        <div className="sidebar-help">
          <div className="help-icon">♡</div>
          <h3>Your health matters</h3>
          <p>Manage appointments and keep your healthcare organized.</p>
          <Link to="/">Explore doctors →</Link>
        </div>

        <div className="sidebar-footer">
          <span className="online-dot"></span>
          Your health, simplified
        </div>
      </aside>

      <main className="patient-main">
        <header className="patient-topbar">
          <div>
            <p className="topbar-label">PATIENT PORTAL</p>
            <h2>My Dashboard</h2>
          </div>

          <Link to="/" className="topbar-find-doctors">
            + Find a Doctor
          </Link>
        </header>

        <section className="patient-welcome">
          <div className="welcome-content">
            <span className="welcome-tag">YOUR PERSONAL HEALTH SPACE</span>

            <h1>
              Hello, {user?.name?.trim()?.split(/\s+/)[0] || "there"}!
            </h1>

            <p>
              Take charge of your health. Your appointments and care
              information are all in one place.
            </p>

            <Link to="/" className="welcome-button">
              Book an Appointment <span>→</span>
            </Link>
          </div>

          <div className="welcome-art" aria-hidden="true">
            <div className="art-circle">
              <div className="art-cross">+</div>
              <div className="art-heart">♡</div>
              <div className="art-pill"></div>
            </div>
          </div>
        </section>

        <section className="patient-stats">
          <article className="stat-card">
            <div className="stat-icon appointments-icon">▦</div>
            <div>
              <p>Total Appointments</p>
              <h3>{appointments.length}</h3>
              <span>All your requests</span>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon pending-icon">◷</div>
            <div>
              <p>Pending Requests</p>
              <h3>{pendingCount}</h3>
              <span>Waiting for confirmation</span>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon confirmed-icon">✓</div>
            <div>
              <p>Confirmed</p>
              <h3>{confirmedCount}</h3>
              <span>Approved appointments</span>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon completed-icon">♡</div>
            <div>
              <p>Completed Visits</p>
              <h3>{completedCount}</h3>
              <span>Your visit history</span>
            </div>
          </article>
        </section>

        <section className="patient-appointments-section">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">YOUR HEALTH JOURNEY</span>
              <h2>My Appointments</h2>
              <p>View your appointment requests and their status.</p>
            </div>

            <Link to="/" className="view-doctors-link">
              Browse doctors →
            </Link>
          </div>

          {loading && (
            <div className="patient-state">
              <div className="loading-spinner"></div>
              <p>Loading your appointments...</p>
            </div>
          )}

          {!loading && error && (
            <div className="patient-state error-state">
              <h3>Unable to load appointments</h3>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && appointments.length === 0 && (
            <div className="patient-empty-state">
              <div className="empty-calendar">▦</div>
              <h3>Your healthcare journey starts here</h3>
              <p>
                You haven't booked an appointment yet. Find a doctor
                and request your first visit.
              </p>
              <Link to="/" className="empty-book-button">
                Find Your Doctor →
              </Link>
            </div>
          )}

          {!loading && !error && appointments.length > 0 && (
            <div className="patient-appointment-list">
              {appointments.map((appointment) => {
                const doctor = appointment.doctor;

                return (
                  <article
                    className="patient-appointment-card"
                    key={appointment._id}
                  >
                    <div className="appointment-doctor-avatar">
                      {(doctor?.name || "D").charAt(0).toUpperCase()}
                    </div>

                    <div className="appointment-doctor-info">
                      <h3>{doctor?.name || "Doctor"}</h3>
                      <p>
                        {doctor?.specialization || "General consultation"}
                      </p>

                      <div className="appointment-date-time">
                        <span>
                          ▦ {formatDate(appointment.appointmentAt)}
                        </span>
                        <span>
                          ◷ {formatTime(appointment.appointmentAt)}
                        </span>
                      </div>

                      {appointment.reason && (
                        <p className="appointment-reason">
                          Reason: {appointment.reason}
                        </p>
                      )}

                      {/* Patient consultation preference */}
                      <div className="patient-consultation-info">
                        <p>
                          <strong>Your Preference:</strong>
                        </p>

                        <span className="patient-consultation-badge">
                          {getPreferenceLabel(
                            appointment.consultationPreference
                          )}
                        </span>

                        {/* Doctor's final consultation mode */}
                        <div className="doctor-consultation-selection">
                          <strong>Doctor Selected:</strong>

                          {appointment.consultationMode ? (
                            <span className="doctor-mode-badge">
                              {getModeLabel(appointment.consultationMode)}
                            </span>
                          ) : appointment.status === "pending" ? (
                            <span className="waiting-doctor-selection">
                              Waiting for doctor selection
                            </span>
                          ) : (
                            <span className="waiting-doctor-selection">
                              Not selected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="appointment-status-area">
                      <span
                        className={
                          "appointment-status " +
                          getStatusClass(appointment.status)
                        }
                      >
                        {appointment.status || "pending"}
                      </span>

                      <span className="appointment-fee">
                        {doctor?.consultationFee != null
                          ? "₹" + doctor.consultationFee
                          : "Fee not set"}
                      </span>

                      {appointment.status === "confirmed" ? (
                        <Link
                          to={"/chat/" + appointment._id}
                          className="patient-chat-button"
                        >
                          Chat with Doctor →
                        </Link>
                      ) : (
                        <button type="button" className="patient-chat-button" disabled>
                          Chat available after confirmation
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="patient-footer">
          <span>© {new Date().getFullYear()} MedQueue</span>
          <span>Healthcare made simpler.</span>
        </footer>
      </main>
    </div>
  );
}