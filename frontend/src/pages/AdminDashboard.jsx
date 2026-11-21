


import { useEffect, useState } from "react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [certificateLoading, setCertificateLoading] = useState("");

  const [activeView, setActiveView] = useState("applications");
  const [allDoctors, setAllDoctors] = useState([]);
  const [allDoctorsLoading, setAllDoctorsLoading] = useState(false);
  const [allDoctorsError, setAllDoctorsError] = useState("");

  const [selectedDoctorDetails, setSelectedDoctorDetails] = useState(null);
  const [doctorDetailsLoading, setDoctorDetailsLoading] = useState(false);
  const [doctorDetailsError, setDoctorDetailsError] = useState("");

  const token = localStorage.getItem("adminToken") || "";

  async function loadDoctors() {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error("Admin token nahi mila. Pehle admin login karo.");
      }

      const response = await fetch("/api/doctors/admin/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Applications load nahi hui.");
      }

      setDoctors(result.doctors || []);
    } catch (err) {
      setError(err.message || "Applications load nahi hui.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAllDoctors() {
    try {
      setAllDoctorsLoading(true);
      setAllDoctorsError("");

      if (!token) {
        throw new Error("Admin token nahi mila. Pehle admin login karo.");
      }

      const response = await fetch("/api/doctors/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Doctors load nahi hue.");
      }

      const approvedDoctors = (result.doctors || []).filter((doctor) => {
        const status =
          doctor.verificationStatus ||
          (doctor.isVerified ? "approved" : "pending");

        return status.toLowerCase() === "approved";
      });

      setAllDoctors(approvedDoctors);
    } catch (err) {
      setAllDoctorsError(err.message || "Doctors load nahi hue.");
    } finally {
      setAllDoctorsLoading(false);
    }
  }

  async function openDoctorDetails(doctor) {
    setSelectedDoctorDetails(null);
    setDoctorDetailsLoading(true);
    setDoctorDetailsError("");
    setActionMessage("");

    try {
      if (!token) {
        throw new Error("Admin token nahi mila. Pehle admin login karo.");
      }

      const response = await fetch(
        `/api/doctors/admin/${doctor._id}/details`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Doctor details load nahi ho sake."
        );
      }

      setSelectedDoctorDetails(result);
    } catch (err) {
      setDoctorDetailsError(
        err.message || "Doctor details load nahi ho sake."
      );
    } finally {
      setDoctorDetailsLoading(false);
    }
  }

  function closeDoctorDetails() {
    setSelectedDoctorDetails(null);
    setDoctorDetailsError("");
    setDoctorDetailsLoading(false);
  }

  function openApplications() {
    setActiveView("applications");
    setActionMessage("");
    closeDoctorDetails();
    loadDoctors();
  }

  function openPendingVerification() {
    setActiveView("pending");
    setActionMessage("");
    closeDoctorDetails();
    loadDoctors();
  }

  function openTotalDoctors() {
    setActiveView("totalDoctors");
    setActionMessage("");
    loadAllDoctors();
  }

  useEffect(() => {
    loadDoctors();
    loadAllDoctors();
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") closeDoctorDetails();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  async function handleDoctorAction(doctorId, action) {
    if (!token) {
      setActionMessage("Admin token nahi mila. Pehle admin login karo.");
      return;
    }

    let reason = "";

    if (action === "reject") {
      const enteredReason = window.prompt(
        "Doctor application reject karne ka reason likho:"
      );

      if (enteredReason === null || !enteredReason.trim()) return;

      reason = enteredReason.trim();

      if (reason.length > 500) {
        setActionMessage(
          "Rejection reason maximum 500 characters ka ho sakta hai."
        );
        return;
      }

      if (
        !window.confirm(
          "Kya tum is doctor ko reject karna chahte ho? Account aur submitted files delete ho sakte hain."
        )
      ) {
        return;
      }
    }

    if (
      action === "approve" &&
      !window.confirm("Kya tum is doctor ko approve karna chahte ho?")
    ) {
      return;
    }

    try {
      setActionLoading(doctorId);
      setActionMessage("");
      setError("");

      const response = await fetch(
        `/api/doctors/admin/${doctorId}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          ...(action === "reject"
            ? { body: JSON.stringify({ reason }) }
            : {}),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Action failed.");
      }

      setDoctors((previous) =>
        previous.filter((doctor) => doctor._id !== doctorId)
      );

      setActionMessage(result.message || "Action successfully completed.");

      await loadAllDoctors();
    } catch (err) {
      setActionMessage(err.message || "Action failed.");
    } finally {
      setActionLoading("");
    }
  }

  async function viewCertificate(doctorId, type) {
    if (!token) {
      setActionMessage("Admin token nahi mila. Pehle admin login karo.");
      return;
    }

    const loadingKey = `${doctorId}-${type}`;

    try {
      setCertificateLoading(loadingKey);
      setActionMessage("");

      const response = await fetch(
        `/api/doctors/admin/${doctorId}/certificate/${type}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        let message = "Certificate open nahi ho saka.";

        try {
          const result = await response.json();
          message = result.message || message;
        } catch {
          // Default error message use hoga.
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const newWindow = window.open(objectUrl, "_blank");

      if (!newWindow) {
        URL.revokeObjectURL(objectUrl);
        throw new Error(
          "Browser mein pop-ups allow karo, phir dobara try karo."
        );
      }

      const cleanup = () => URL.revokeObjectURL(objectUrl);

      newWindow.addEventListener("beforeunload", cleanup, { once: true });
      window.setTimeout(cleanup, 5 * 60 * 1000);
    } catch (err) {
      setActionMessage(
        err.message || "Certificate open karte waqt error aaya."
      );
    } finally {
      setCertificateLoading("");
    }
  }

  function getDoctorImage(profileImage) {
    if (!profileImage) return "";

    if (profileImage.startsWith("/uploads/")) {
      return `http://localhost:5000${profileImage}`;
    }

    return profileImage;
  }

  async function deleteDoctor(doctor) {
    const confirmed = window.confirm(
      `Kya tum ${doctor.name} ko permanently delete karna chahte ho? Isse related appointments aur chats bhi delete ho sakte hain.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(doctor._id);
      setActionMessage("");
      setAllDoctorsError("");

      const response = await fetch(`/api/doctors/admin/${doctor._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Doctor delete nahi hua.");
      }

      setAllDoctors((previous) =>
        previous.filter((item) => item._id !== doctor._id)
      );

      if (selectedDoctorDetails?.doctor?._id === doctor._id) {
        closeDoctorDetails();
      }

      setActionMessage(result.message || "Doctor deleted successfully.");
    } catch (err) {
      setAllDoctorsError(err.message || "Doctor delete nahi hua.");
    } finally {
      setActionLoading("");
    }
  }

  const selectedDoctor = selectedDoctorDetails?.doctor;
  const appointments = selectedDoctorDetails?.appointments || [];

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/image/logo.png" alt="MedQueue Logo" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
          <span>MedQueue</span>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <button
          type="button"
          className={`sidebar-item ${
            activeView === "applications" ? "active" : ""
          }`}
          onClick={openApplications}
        >
          <span>▦</span>
          Doctor Applications
        </button>

        <button
          type="button"
          className={`sidebar-item ${
            activeView === "pending" ? "active" : ""
          }`}
          onClick={openPendingVerification}
        >
          <span>◷</span>
          Pending Verification
          <span className="sidebar-count">{doctors.length}</span>
        </button>

        <button
          type="button"
          className={`sidebar-item ${
            activeView === "totalDoctors" ? "active" : ""
          }`}
          onClick={openTotalDoctors}
        >
          <span>♙</span>
          Total Doctors
          <span className="sidebar-count">{allDoctors.length}</span>
        </button>

        <div className="sidebar-bottom">
          <span className="admin-avatar">A</span>
          <div>
            <strong>Administrator</strong>
            <small>Admin Panel</small>
          </div>
        </div>
      </aside>

      <section className="admin-content">
        {activeView !== "totalDoctors" ? (
          <>
            <header className="admin-topbar">
              <div>
                <p className="admin-breadcrumb">Workspace / Doctors</p>
                <h1>
                  {activeView === "pending"
                    ? "Pending Verification"
                    : "Doctor Verification"}
                </h1>
                <p className="admin-subtitle">
                  Review doctor applications and verify their credentials.
                </p>
              </div>

              <div className="admin-top-badge">
                <span className="status-dot" />
                Verification Center
              </div>
            </header>

            <div className="admin-stats">
              <div className="admin-stat-card">
                <span className="stat-icon teal">♙</span>
                <div>
                  <p>Pending Applications</p>
                  <h2>{loading ? "—" : doctors.length}</h2>
                </div>
              </div>

              <div className="admin-stat-card">
                <span className="stat-icon amber">◷</span>
                <div>
                  <p>Awaiting Review</p>
                  <h2>{loading ? "—" : doctors.length}</h2>
                </div>
              </div>
            </div>

            <div className="applications-heading">
              <div>
                <h2>Applications</h2>
                <p>Review submitted details and documents below.</p>
              </div>
              <span className="application-total">
                {doctors.length} applications
              </span>
            </div>

            {actionMessage && (
              <div className="admin-message">{actionMessage}</div>
            )}

            {loading && (
              <div className="admin-message">Loading applications...</div>
            )}

            {error && (
              <div className="admin-message error-message">
                {error}
                <button type="button" onClick={loadDoctors}>
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && doctors.length === 0 && (
              <div className="admin-empty">
                <span>✓</span>
                <h3>All caught up!</h3>
                <p>No pending doctor applications right now.</p>
              </div>
            )}

            <div className="doctor-application-list">
              {doctors.map((doctor) => (
                <article className="doctor-application" key={doctor._id}>
                  <div className="doctor-card-header">
                    <div className="doctor-identity">
                      {doctor.profileImage ? (
                        <img
                          className="doctor-photo"
                          src={getDoctorImage(doctor.profileImage)}
                          alt={doctor.name || "Doctor"}
                        />
                      ) : (
                        <div className="doctor-photo doctor-photo-placeholder">
                          {doctor.name?.charAt(0) || "D"}
                        </div>
                      )}

                      <div>
                        <h3>{doctor.name}</h3>
                        <p>{doctor.specialization}</p>
                        <span className="doctor-qualification">
                          {doctor.qualification}
                        </span>
                      </div>
                    </div>

                    <span className="pending-badge">
                      <span />
                      Pending review
                    </span>
                  </div>

                  <div className="doctor-details-grid">
                    <div>
                      <span className="detail-label">EXPERIENCE</span>
                      <strong>{doctor.experienceYears ?? 0} years</strong>
                    </div>
                    <div>
                      <span className="detail-label">CONSULTATION FEE</span>
                      <strong>₹{doctor.consultationFee ?? 0}</strong>
                    </div>
                    <div>
                      <span className="detail-label">REGISTRATION NUMBER</span>
                      <strong>
                        {doctor.medicalRegistrationNumber || "Not provided"}
                      </strong>
                    </div>
                    <div>
                      <span className="detail-label">ADDRESS</span>
                      <strong>{doctor.address || "Not provided"}</strong>
                    </div>
                  </div>

                  <div className="document-section">
                    <h4>Submitted Documents</h4>

                    <div className="document-list">
                      <div className="document-item">
                        <span className="document-icon">PDF</span>
                        <div className="document-info">
                          <strong>Degree Certificate</strong>
                          <small>
                            {doctor.degreeCertificate
                              ? "Document submitted"
                              : "Not available"}
                          </small>

                          {doctor.degreeCertificate && (
                            <button
                              type="button"
                              className="view-certificate-button"
                              disabled={
                                certificateLoading === `${doctor._id}-degree`
                              }
                              onClick={() =>
                                viewCertificate(doctor._id, "degree")
                              }
                            >
                              {certificateLoading === `${doctor._id}-degree`
                                ? "Opening..."
                                : "View Certificate"}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="document-item">
                        <span className="document-icon">ID</span>
                        <div className="document-info">
                          <strong>Medical Registration</strong>
                          <small>
                            {doctor.registrationCertificate
                              ? "Document submitted"
                              : "Not available"}
                          </small>

                          {doctor.registrationCertificate && (
                            <button
                              type="button"
                              className="view-certificate-button"
                              disabled={
                                certificateLoading ===
                                `${doctor._id}-registration`
                              }
                              onClick={() =>
                                viewCertificate(doctor._id, "registration")
                              }
                            >
                              {certificateLoading ===
                              `${doctor._id}-registration`
                                ? "Opening..."
                                : "View Certificate"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="document-note">
                      Verify the original documents before approving an
                      application.
                    </p>
                  </div>

                  <div className="doctor-card-footer">
                    <span className="review-hint">
                      Verify the submitted details before making a decision.
                    </span>

                    <div className="review-actions">
                      <button
                        type="button"
                        className="reject-button"
                        disabled={actionLoading === doctor._id}
                        onClick={() =>
                          handleDoctorAction(doctor._id, "reject")
                        }
                      >
                        {actionLoading === doctor._id
                          ? "Please wait..."
                          : "Reject"}
                      </button>

                      <button
                        type="button"
                        className="approve-button"
                        disabled={actionLoading === doctor._id}
                        onClick={() =>
                          handleDoctorAction(doctor._id, "approve")
                        }
                      >
                        {actionLoading === doctor._id
                          ? "Please wait..."
                          : "✓ Approve"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="total-doctors-view">
            <header className="total-doctors-header">
              <div>
                <p className="admin-breadcrumb">Workspace / Doctors</p>
                <h1>Total Doctors</h1>
                <p className="admin-subtitle">
                  View approved doctors and their details.
                </p>
              </div>

              <button
                type="button"
                className="refresh-doctors"
                onClick={loadAllDoctors}
                disabled={allDoctorsLoading}
              >
                {allDoctorsLoading ? "Loading..." : "↻ Refresh"}
              </button>
            </header>

            {actionMessage && (
              <div className="admin-message">{actionMessage}</div>
            )}

            <div className="admin-stats">
              <div className="admin-stat-card total-doctors-stat">
                <span className="stat-icon teal">♙</span>
                <div>
                  <p>Total Approved Doctors</p>
                  <h2>{allDoctorsLoading ? "—" : allDoctors.length}</h2>
                </div>
              </div>
            </div>

            {allDoctorsLoading && (
              <div className="admin-message">Loading doctors...</div>
            )}

            {allDoctorsError && (
              <div className="admin-message error-message">
                {allDoctorsError}
                <button type="button" onClick={loadAllDoctors}>
                  Retry
                </button>
              </div>
            )}

            {!allDoctorsLoading &&
              !allDoctorsError &&
              allDoctors.length === 0 && (
                <div className="admin-empty">
                  <span>♙</span>
                  <h3>No approved doctors found</h3>
                  <p>Approved doctors will appear here.</p>
                </div>
              )}

            {!allDoctorsLoading && !allDoctorsError && allDoctors.length > 0 && (
              <section className="admin-stat-card" style={{ display: "block", marginBottom: "24px" }}>
                <div style={{ marginBottom: "14px" }}>
                  <h2 className="admin-breadcrumb" style={{ fontSize: "16px", marginBottom: "6px" }}>Agent Commission Summary</h2>
                  <p className="admin-subtitle">₹200 commission for each approved doctor with a referral code.</p>
                </div>
                <div className="total-doctors-table-wrap">
                  <table className="total-doctors-table">
                    <thead>
                      <tr>
                        <th>Referral Code</th>
                        <th>Approved Doctors</th>
                        <th>Total Commission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(
                        allDoctors.reduce((groups, doctor) => {
                          const code = (doctor.referralCode || "").trim().toUpperCase();
                          if (code) groups[code] = (groups[code] || 0) + 1;
                          return groups;
                        }, {})
                      ).map(([code, count]) => (
                        <tr key={code}>
                          <td><strong>{code}</strong></td>
                          <td>{count}</td>
                          <td>₹{count * 200}</td>
                        </tr>
                      ))}
                      {allDoctors.every((doctor) => !doctor.referralCode?.trim()) && (
                        <tr><td colSpan={3}>No approved doctors have used a referral code yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {!allDoctorsLoading &&
              !allDoctorsError &&
              allDoctors.length > 0 && (
                <div className="total-doctors-table-wrap">
                  <table className="total-doctors-table">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Specialization</th>
                        <th>Qualification</th>
                        <th>Experience</th>
                        <th>Consultation Fee</th>
                        <th>Referral Code</th>
                        <th>Doctor Details</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {allDoctors.map((doctor) => (
                        <tr key={doctor._id}>
                          <td>
                            <div className="total-doctor-identity">
                              {doctor.profileImage ? (
                                <img
                                  src={getDoctorImage(doctor.profileImage)}
                                  alt={doctor.name || "Doctor"}
                                />
                              ) : (
                                <span className="total-doctor-avatar">
                                  {doctor.name?.charAt(0) || "D"}
                                </span>
                              )}

                              <div>
                                <strong>
                                  {doctor.name || "Unnamed Doctor"}
                                </strong>
                                <small>
                                  {doctor.user?.email ||
                                    doctor.email ||
                                    "Email unavailable"}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>{doctor.specialization || "—"}</td>
                          <td>{doctor.qualification || "—"}</td>
                          <td>{doctor.experienceYears ?? 0} years</td>
                          <td>₹{doctor.consultationFee ?? 0}</td>
                          <td>{doctor.referralCode || "—"}</td>

                          <td>
                            <button
                              type="button"
                              className="view-doctor-button"
                              onClick={() => openDoctorDetails(doctor)}
                            >
                              View Details
                            </button>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="delete-doctor-button"
                              disabled={actionLoading === doctor._id}
                              onClick={() => deleteDoctor(doctor)}
                            >
                              {actionLoading === doctor._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        )}
      </section>

      {(selectedDoctorDetails ||
        doctorDetailsLoading ||
        doctorDetailsError) && (
        <div
          className="doctor-modal-backdrop"
          onClick={closeDoctorDetails}
        >
          <section
            className="doctor-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Doctor details"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="doctor-modal-header">
              <div>
                <p className="admin-breadcrumb">Doctor Management / Profile</p>
                <h2>Doctor Details</h2>
              </div>

              <button
                type="button"
                className="doctor-modal-close"
                aria-label="Close doctor details"
                onClick={closeDoctorDetails}
              >
                ×
              </button>
            </header>

            <div className="doctor-modal-body">
              {doctorDetailsLoading && (
                <div className="admin-message">
                  Loading doctor details...
                </div>
              )}

              {doctorDetailsError && (
                <div className="admin-message error-message">
                  {doctorDetailsError}
                  <button type="button" onClick={closeDoctorDetails}>
                    Close
                  </button>
                </div>
              )}

              {!doctorDetailsLoading && selectedDoctor && (
                <>
                  <div className="doctor-modal-profile">
                    {selectedDoctor.profileImage ? (
                      <img
                        className="doctor-modal-photo"
                        src={getDoctorImage(selectedDoctor.profileImage)}
                        alt={selectedDoctor.name || "Doctor"}
                      />
                    ) : (
                      <div className="doctor-modal-photo doctor-modal-photo-placeholder">
                        {selectedDoctor.name?.charAt(0) || "D"}
                      </div>
                    )}

                    <div className="doctor-modal-profile-info">
                      <h3>{selectedDoctor.name || "Doctor"}</h3>
                      <p>
                        {selectedDoctor.specialization ||
                          "Specialization unavailable"}
                      </p>
                      <span>
                        {selectedDoctor.qualification ||
                          "Qualification unavailable"}
                      </span>
                    </div>
                  </div>

                  <section className="doctor-modal-section">
                    <h3>Professional Information</h3>

                    <div className="doctor-modal-info-grid">
                      <div>
                        <span>Experience</span>
                        <strong>
                          {selectedDoctor.experienceYears ?? 0} years
                        </strong>
                      </div>
                      <div>
                        <span>Consultation Fee</span>
                        <strong>₹{selectedDoctor.consultationFee ?? 0}</strong>
                      </div>
                      <div>
                        <span>Registration Number</span>
                        <strong>
                          {selectedDoctor.medicalRegistrationNumber || "—"}
                        </strong>
                      </div> 
                      <div>
                        <span>Agent / Referral Code</span>
                        <strong>{selectedDoctor.referralCode || "—"}</strong>
                      </div>
                      <div>
                        <span>Email</span>
                        <strong>{selectedDoctor.user?.email || "—"}</strong>
                      </div>
                      <div>
                        <span>Phone</span>
                        <strong>{selectedDoctor.user?.phone || "—"}</strong>
                      </div>
                      <div>
                        <span>Address</span>
                        <strong>
                          {[
                            selectedDoctor.address,
                            selectedDoctor.city,
                          ]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </strong>
                      </div>
                    </div>

                    {selectedDoctor.bio && (
                      <p className="doctor-modal-bio">
                        {selectedDoctor.bio}
                      </p>
                    )}
                  </section>

                  <section className="doctor-modal-section">
                    <h3>Certificates & Documents</h3>

                    <div className="doctor-modal-documents">
                      <div className="doctor-modal-document">
                        <div>
                          <strong>Degree Certificate</strong>
                          <p>
                            {selectedDoctor.degreeCertificate
                              ? "Certificate available"
                              : "No certificate uploaded"}
                          </p>
                        </div>

                        {selectedDoctor.degreeCertificate && (
                          <button
                            type="button"
                            className="view-certificate-button"
                            disabled={
                              certificateLoading ===
                              `${selectedDoctor._id}-degree`
                            }
                            onClick={() =>
                              viewCertificate(selectedDoctor._id, "degree")
                            }
                          >
                            {certificateLoading ===
                            `${selectedDoctor._id}-degree`
                              ? "Opening..."
                              : "View Certificate"}
                          </button>
                        )}
                      </div>

                      <div className="doctor-modal-document">
                        <div>
                          <strong>Registration Certificate</strong>
                          <p>
                            {selectedDoctor.registrationCertificate
                              ? "Certificate available"
                              : "No certificate uploaded"}
                          </p>
                        </div>

                        {selectedDoctor.registrationCertificate && (
                          <button
                            type="button"
                            className="view-certificate-button"
                            disabled={
                              certificateLoading ===
                              `${selectedDoctor._id}-registration`
                            }
                            onClick={() =>
                              viewCertificate(
                                selectedDoctor._id,
                                "registration"
                              )
                            }
                          >
                            {certificateLoading ===
                            `${selectedDoctor._id}-registration`
                              ? "Opening..."
                              : "View Certificate"}
                          </button>
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="doctor-modal-section">
                    <h3>Patients & Appointments</h3>

                    <div className="doctor-modal-summary">
                      <div>
                        <span>Total Patients</span>
                        <strong>
                          {selectedDoctorDetails.patientCount ?? 0}
                        </strong>
                      </div>
                      <div>
                        <span>Total Appointments</span>
                        <strong>{appointments.length}</strong>
                      </div>
                    </div>

                    {appointments.length > 0 ? (
                      appointments.map((appointment) => (
                        <article
                          className="doctor-modal-appointment"
                          key={appointment._id}
                        >
                          <h4>
                            Patient:{" "}
                            {appointment.patient?.name ||
                              "Patient information unavailable"}
                          </h4>

                          <p>Email: {appointment.patient?.email || "—"}</p>
                          <p>Phone: {appointment.patient?.phone || "—"}</p>
                          <p>
                            Appointment:{" "}
                            {appointment.appointmentAt
                              ? new Date(
                                  appointment.appointmentAt
                                ).toLocaleString()
                              : "Date unavailable"}
                          </p>

                          <div className="doctor-modal-chat">
                            <h4>Chat History</h4>

                            {appointment.messages?.length > 0 ? (
                              appointment.messages.map((message) => (
                                <div
                                  className="doctor-modal-message"
                                  key={message._id}
                                >
                                  <strong>
                                    {message.sender?.name ||
                                      message.sender?.role ||
                                      "User"}
                                  </strong>

                                  {message.text && <p>{message.text}</p>}

                                  {message.imageFilename && (
                                    <p>
                                      Image attachment: {message.imageFilename}
                                    </p>
                                  )}

                                  <small>
                                    {message.createdAt
                                      ? new Date(
                                          message.createdAt
                                        ).toLocaleString()
                                      : ""}
                                  </small>
                                </div>
                              ))
                            ) : (
                              <p>
                                No chat messages found for this appointment.
                              </p>
                            )}
                          </div>
                        </article>
                      ))
                    ) : (
                      <p>No appointments found for this doctor.</p>
                    )}
                  </section>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}




