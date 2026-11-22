
// import { useEffect, useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { getDoctors } from "../services/api";
// import "./BookAppointment.css";

// export default function BookAppointment() {
//   const { doctorId } = useParams();
//   const navigate = useNavigate();

//   const [doctor, setDoctor] = useState(null);
//   const [appointmentAt, setAppointmentAt] = useState("");
//   const [durationMinutes, setDurationMinutes] = useState("30");
//   const [reason, setReason] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [consultationPreference, setConsultationPreference] = useState("both");

//   useEffect(() => {
//     let cancelled = false;

//     async function loadDoctor() {
//       try {
//         const result = await getDoctors();

//         const doctors = Array.isArray(result)
//           ? result
//           : Array.isArray(result?.doctors)
//             ? result.doctors
//             : Array.isArray(result?.data?.doctors)
//               ? result.data.doctors
//               : Array.isArray(result?.data)
//                 ? result.data
//                 : [];

//         const selectedDoctor = doctors.find(
//           (item) => String(item._id) === String(doctorId)
//         );

//         if (!cancelled) {
//           if (selectedDoctor) {
//             setDoctor(selectedDoctor);
//           } else {
//             setError("Doctor nahi mila ya available nahi hai.");
//           }
//         }
//       } catch {
//         if (!cancelled) {
//           setError("Doctor details load nahi hui. Please dobara try karein.");
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     }

//     loadDoctor();

//     return () => {
//       cancelled = true;
//     };
//   }, [doctorId]);

//   async function handleSubmit(event) {
//     event.preventDefault();
//     setError("");

//     const token = localStorage.getItem("token");

//     let user = null;

//     try {
//       user = JSON.parse(localStorage.getItem("user") || "null");
//     } catch {
//       user = null;
//     }

//     if (!token || user?.role !== "patient") {
//       navigate("/login/patient");
//       return;
//     }

//     if (!appointmentAt) {
//       setError("Appointment date aur time select karein.");
//       return;
//     }

//     if (new Date(appointmentAt).getTime() <= Date.now()) {
//       setError("Please future date aur time select karein.");
//       return;
//     }

//     setSaving(true);

//     try {
//       const response = await fetch("/api/appointments", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: "Bearer " + token,
//         },
//         body: JSON.stringify({
//           doctorId: doctorId,
//           appointmentAt: new Date(appointmentAt).toISOString(),
//           durationMinutes: Number(durationMinutes),
//           reason: reason.trim(),
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.message || "Appointment request submit nahi hui."
//         );
//       }

//       alert("Appointment request successfully submit ho gayi!");
//       navigate("/patient/dashboard");
//     } catch (err) {
//       setError(
//         err.message || "Server error. Please dobara try karein."
//       );
//     } finally {
//       setSaving(false);
//     }
//   }

//   const endTime = appointmentAt
//     ? new Date(
//         new Date(appointmentAt).getTime() +
//           Number(durationMinutes) * 60000
//       )
//     : null;

//   const formatTime = (date) =>
//     date?.toLocaleTimeString("en-IN", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });

//   if (loading) {
//     return <p className="booking-message">Doctor details load ho rahi hain...</p>;
//   }

//   if (!doctor) {
//     return (
//       <div className="booking-container">
//         <p className="booking-error">{error}</p>
//         <Link to="/">Back to Home</Link>
//       </div>
//     );
//   }

//   return (
//     <div className="booking-container">
//       <Link to="/" className="booking-back">
//         ← Back to doctors
//       </Link>

//       <div className="booking-card">
//         <h1>Book Appointment</h1>

//         <p className="booking-subtitle">
//           Apne doctor ke saath appointment request karein.
//         </p>

//         <div className="booking-doctor">
//           <h2>{doctor.name || "Doctor"}</h2>
//           <p>{doctor.specialization || "Specialization not set"}</p>
//           <p>Consultation Fee: ₹{doctor.consultationFee ?? 0}</p>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <label htmlFor="appointmentAt">
//             Appointment Date &amp; Start Time
//           </label>

//           <input
//             id="appointmentAt"
//             type="datetime-local"
//             value={appointmentAt}
//             min={new Date(
//               Date.now() - new Date().getTimezoneOffset() * 60000
//             )
//               .toISOString()
//               .slice(0, 16)}
//             onChange={(event) => setAppointmentAt(event.target.value)}
//             required
//           />

//           <label htmlFor="durationMinutes">
//             Appointment Duration
//           </label>

//           <select
//             id="durationMinutes"
//             value={durationMinutes}
//             onChange={(event) => setDurationMinutes(event.target.value)}
//             required
//           >
//             <option value="10">10 minutes</option>
//             <option value="15">15 minutes</option>
//             <option value="30">30 minutes</option>
//             <option value="45">45 minutes</option>
//             <option value="60">60 minutes</option>
//           </select>

//           {appointmentAt && (
//             <p className="booking-time-preview">
//               <strong>Selected time:</strong>{" "}
//               {formatTime(new Date(appointmentAt))} – {formatTime(endTime)}
//             </p>
//           )}

//           <label htmlFor="reason">
//             Reason for Appointment
//           </label>

//           <textarea
//             id="reason"
//             value={reason}
//             onChange={(event) => setReason(event.target.value)}
//             placeholder="Apni health problem briefly batayein (optional)"
//             maxLength={500}
//             rows={4}
//           />

//           {error && <p className="booking-error">{error}</p>}

//           <button type="submit" disabled={saving}>
//             {saving ? "Confirming..." : "Confirm Booking"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }





import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getDoctors } from "../services/api";
import "./BookAppointment.css";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [appointmentAt, setAppointmentAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Patient consultation preference
  const [consultationPreference, setConsultationPreference] =
    useState("both");

  useEffect(() => {
    let cancelled = false;

    async function loadDoctor() {
      try {
        const result = await getDoctors();

        const doctors = Array.isArray(result)
          ? result
          : Array.isArray(result?.doctors)
            ? result.doctors
            : Array.isArray(result?.data?.doctors)
              ? result.data.doctors
              : Array.isArray(result?.data)
                ? result.data
                : [];

        const selectedDoctor = doctors.find(
          (item) => String(item._id) === String(doctorId)
        );

        if (!cancelled) {
          if (selectedDoctor) {
            setDoctor(selectedDoctor);
            try {
              const draft = JSON.parse(sessionStorage.getItem("medqueuePendingBooking") || "null");
              if (draft?.doctorId === String(doctorId)) {
                setAppointmentAt(draft.appointmentAt || "");
                setDurationMinutes(String(draft.durationMinutes || "30"));
                setReason(draft.reason || "");
                setConsultationPreference(draft.consultationPreference || "both");
              }
            } catch {
              sessionStorage.removeItem("medqueuePendingBooking");
            }
          } else {
            setError("Doctor nahi mila ya available nahi hai.");
          }
        }
      } catch {
        if (!cancelled) {
          setError(
            "Doctor details load nahi hui. Please dobara try karein."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDoctor();

    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const token = localStorage.getItem("token");

    let user = null;

    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      user = null;
    }

    if (!appointmentAt) {
      setError("Appointment date aur time select karein.");
      return;
    }

    if (new Date(appointmentAt).getTime() <= Date.now()) {
      setError("Please future date aur time select karein.");
      return;
    }

    if (!["online", "clinic", "both"].includes(consultationPreference)) {
      setError("Please consultation type select karein.");
      return;
    }

    if (!token || user?.role !== "patient") {
      sessionStorage.setItem("medqueuePendingBooking", JSON.stringify({
        doctorId: String(doctorId),
        appointmentAt,
        durationMinutes,
        reason,
        consultationPreference,
      }));
      navigate("/login/patient", { state: { fromBooking: true } });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          doctorId: doctorId,
          appointmentAt: new Date(appointmentAt).toISOString(),
          durationMinutes: Number(durationMinutes),
          reason: reason.trim(),

          // New consultation preference
          consultationPreference: consultationPreference,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Appointment request submit nahi hui."
        );
      }

      sessionStorage.removeItem("medqueuePendingBooking");
      alert(data.message || "Appointment request successfully submitted!");
      navigate("/patient/dashboard");
    } catch (err) {
      setError(
        err.message || "Server error. Please dobara try karein."
      );
    } finally {
      setSaving(false);
    }
  }

  const endTime = appointmentAt
    ? new Date(
      new Date(appointmentAt).getTime() +
      Number(durationMinutes) * 60000
    )
    : null;

  const formatTime = (date) =>
    date?.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <p className="booking-message">
        Doctor details load ho rahi hain...
      </p>
    );
  }

  if (!doctor) {
    return (
      <div className="booking-container">
        <p className="booking-error">{error}</p>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <Link to="/" className="booking-back">
        ← Back to doctors
      </Link>

      <div className="booking-card">
        <h1>Book Appointment</h1>

        <p className="booking-subtitle">
          Apne doctor ke saath appointment request karein.
        </p>

        <div className="booking-doctor">
          <h2>{doctor.name || "Doctor"}</h2>
          <p>{doctor.specialization || "Specialization not set"}</p>
          <p>Consultation Fee: ₹{doctor.consultationFee ?? 0}</p>
        </div>

        {doctor.isOnBreak && (
          <div className="booking-message" role="status">
            {doctor.breakMessage || "Doctor is currently on a short break"}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Consultation Preference */}

          <div className="consultation-selection">
            <h3>How would you like to consult?</h3>

            <p>
              Select your preferred consultation option.
            </p>

            <div className="consultation-options">

              <label
                className={`consultation-option ${consultationPreference === "online" ? "active" : ""
                  }`}
              >
                <input
                  type="radio"
                  name="consultationPreference"
                  value="online"
                  checked={consultationPreference === "online"}
                  onChange={() =>
                    setConsultationPreference("online")
                  }
                />

                <span className="consultation-icon">🎥</span>

                <strong>Online Consultation</strong>

                <small>
                  Consult with doctor through video call from home.
                </small>
              </label>

              <label
                className={`consultation-option ${consultationPreference === "clinic" ? "active" : ""
                  }`}
              >
                <input
                  type="radio"
                  name="consultationPreference"
                  value="clinic"
                  checked={consultationPreference === "clinic"}
                  onChange={() =>
                    setConsultationPreference("clinic")
                  }
                />

                <span className="consultation-icon">🏥</span>

                <strong>Visit Doctor's Clinic</strong>

                <small>
                  Visit the doctor's clinic for in-person consultation.
                </small>
              </label>

              <label
                className={`consultation-option ${consultationPreference === "both" ? "active" : ""
                  }`}
              >
                <input
                  type="radio"
                  name="consultationPreference"
                  value="both"
                  checked={consultationPreference === "both"}
                  onChange={() =>
                    setConsultationPreference("both")
                  }
                />

                <span className="consultation-icon">🔄</span>

                <strong>Both Options</strong>

                <small>
                  Doctor can choose online or clinic consultation.
                </small>
              </label>

            </div>
          </div>

          <label htmlFor="appointmentAt">
            Appointment Date &amp; Start Time
          </label>

          <input
            id="appointmentAt"
            type="datetime-local"
            value={appointmentAt}
            min={new Date(
              Date.now() - new Date().getTimezoneOffset() * 60000
            )
              .toISOString()
              .slice(0, 16)}
            onChange={(event) =>
              setAppointmentAt(event.target.value)
            }
            required
          />

          <label htmlFor="durationMinutes">
            Appointment Duration
          </label>

          <select
            id="durationMinutes"
            value={durationMinutes}
            onChange={(event) =>
              setDurationMinutes(event.target.value)
            }
            required
          >
            <option value="10">10 minutes</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
          </select>

          {appointmentAt && (
            <p className="booking-time-preview">
              <strong>Selected time:</strong>{" "}
              {formatTime(new Date(appointmentAt))} –{" "}
              {formatTime(endTime)}
            </p>
          )}

          <label htmlFor="reason">
            Reason for Appointment
          </label>

          <textarea
            id="reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Apni health problem briefly batayein (optional)"
            maxLength={500}
            rows={4}
          />

          {error && (
            <p className="booking-error">{error}</p>
          )}

          <button type="submit" disabled={saving}>
            {saving
              ? "Submitting..."
              : "Submit Appointment Request"}
          </button>

        </form>
      </div>
    </div>
  );
}