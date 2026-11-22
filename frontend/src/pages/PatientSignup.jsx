
// import { useState } from "react";
// import { Link } from "react-router-dom";

// export default function PatientSignup() {
//   const [message, setMessage] = useState("");
//   const [isError, setIsError] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     setMessage("");
//     setIsError(false);
//     setLoading(true);

//     const form = event.currentTarget;
//     const formData = new FormData(form);

//     const patientData = {
//       name: formData.get("name"),
//       email: formData.get("email"),
//       password: formData.get("password"),
//       phone: formData.get("phone"),
//     };

//     try {
//       const response = await fetch("/api/auth/register/patient", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(patientData),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           result.message || "Patient registration failed."
//         );
//       }

//       setMessage(result.message);
//       form.reset();
//     } catch (error) {
//       setIsError(true);
//       setMessage(
//         error.message || "Unable to connect to the server."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="form-page">
//       <p className="eyebrow">PATIENT REGISTRATION</p>
//       <h1>Create your patient account</h1>

//       <form className="signup-form" onSubmit={handleSubmit}>
//         <label>
//           Full name
//           <input
//             type="text"
//             name="name"
//             placeholder="Your full name"
//             maxLength={100}
//             required
//           />
//         </label>

//         <label>
//           Email
//           <input
//             type="email"
//             name="email"
//             placeholder="you@example.com"
//             required
//           />
//         </label>

//         <label>
//           Password
//           <input
//             type="password"
//             name="password"
//             placeholder="Minimum 8 characters"
//             minLength={8}
//             required
//           />
//         </label>

//         <label>
//           Phone number
//           <input
//             type="tel"
//             name="phone"
//             placeholder="Your phone number"
//             maxLength={20}
//             required
//           />
//         </label>

//         <button type="submit" disabled={loading}>
//           {loading ? "Creating Account..." : "Create Patient Account"}
//         </button>
//       </form>

//       {message && (
//         <p
//           role="status"
//           style={{
//             color: isError ? "#dc2626" : "#15803d",
//             marginTop: "16px",
//           }}
//         >
//           {message}
//         </p>
//       )}

//       {/* <p style={{ marginTop: "16px" }}>
//         Already have an account? Login functionality will be added next.
//       </p> */}

//       <Link to="/" className="back-link">
//         ← Back to Home
//       </Link>
//     </main>
//   );
// }


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

export default function PatientSignup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setIsError(false);
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const patientData = {
      name: formData.get("name").trim(),
      email: formData.get("email").trim().toLowerCase(),
      password: formData.get("password"),
      phone: formData.get("phone").trim(),
    };

    try {
      const response = await fetch(`${API_BASE}/auth/register/patient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Patient registration failed."
        );
      }

      if (!result.token || !result.user) {
        throw new Error("Account created but automatic login was not returned. Please login.");
      }

      login(result.token, result.user);

      let pendingBooking = null;
      try {
        pendingBooking = JSON.parse(sessionStorage.getItem("medqueuePendingBooking") || "null");
      } catch {
        sessionStorage.removeItem("medqueuePendingBooking");
      }

      if (pendingBooking?.doctorId) {
        navigate(`/book-appointment/${pendingBooking.doctorId}`, { replace: true });
      } else {
        navigate("/patient/dashboard", { replace: true });
      }

    } catch (error) {
      setIsError(true);
      setMessage(
        error.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="form-page">

      <p className="eyebrow">PATIENT REGISTRATION</p>

      <h1>Create your patient account</h1>

      <p>Register with MedQueue to book doctor appointments.</p>

      <form className="signup-form" onSubmit={handleSubmit}>

        <label>
          Full Name
          <input
            type="text"
            name="name"
            placeholder="Your full name"
            maxLength={100}
            autoComplete="name"
            required
          />
        </label>

        <label>
          Email Address
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            placeholder="Minimum 8 characters"
            minLength={8}
            autoComplete="new-password"
            required
          />
        </label>

        <label>
          Phone Number
          <input
            type="tel"
            name="phone"
            placeholder="Your phone number"
            maxLength={20}
            autoComplete="tel"
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Patient Account"}
        </button>

      </form>

      {message && (
        <p
          role="alert"
          style={{
            color: isError ? "#dc2626" : "#15803d",
            marginTop: "16px",
          }}
        >
          {message}
        </p>
      )}

      <p style={{ marginTop: "18px" }}>
        Already have an account?{" "}
        <Link to="/login">Login</Link>
      </p>

      <Link to="/" className="back-link">
        ← Back to Home
      </Link>

    </main>
  );
}