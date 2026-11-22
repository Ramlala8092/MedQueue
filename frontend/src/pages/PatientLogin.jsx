
// import { Link, useNavigate } from "react-router-dom";
// import { useState } from "react";
// // import "./PatientLogin.css";


// export default function PatientLogin() {
//   const navigate = useNavigate();
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     const formData = new FormData(e.currentTarget);

//     try {
//       const response = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: formData.get("email"),
//           password: formData.get("password"),
//           role: "patient",
//         }),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.message || "Login failed");
//       }

//       localStorage.setItem("token", result.token);
//       localStorage.setItem("user", JSON.stringify(result.user));

//       navigate("/patient/dashboard");
//     } catch (err) {
//       setError(err.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="signup-page">
//       <p className="eyebrow">MEDQUEUE PATIENT PORTAL</p>
//       <h1>Welcome Back!</h1>
//       <p>Login to access your personal dashboard.</p>

//       <form className="signup-form" onSubmit={handleSubmit}>
//         <label>
//           Email Address
//           <input
//             type="email"
//             name="email"
//             placeholder="patient@example.com"
//             autoComplete="email"
//             required
//           />
//         </label>

//         <label>
//           Password
//           <input
//             type="password"
//             name="password"
//             placeholder="Enter your password"
//             autoComplete="current-password"
//             required
//           />
//         </label>

//         {error && <p role="alert" style={{ color: "red" }}>{error}</p>}

//         <button type="submit" disabled={loading}>
//           {loading ? "Logging in..." : "Login as Patient"}
//         </button>
//       </form>

//       <p>
//         New patient? <Link to="/signup/patient">Create account</Link>
//       </p>

//       <Link to="/login" className="back-link">
//         ← Back to login options
//       </Link>
//     </main>
//   );
// }



import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./PatientLogin.css";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

export default function PatientLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
          role: "patient",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
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
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="patient-login-page">
      <section className="patient-login-visual">
        <Link to="/" className="patient-brand">
          <img src="/image/logo.png" alt="MedQueue Logo" style={{ width: "39px", height: "39px", objectFit: "contain" }} />
          <span>MedQueue</span>
        </Link>

        <div className="patient-visual-content">
          <span className="patient-visual-label">
            YOUR HEALTH, YOUR PRIORITY
          </span>

          <h1>
            Care that
            <br />
            puts <span>you first.</span>
          </h1>

          <p>
            Find trusted doctors, manage your appointments,
            and stay connected with your healthcare team
            — all in one simple place.
          </p>

          <div className="patient-visual-features">
            <div>
              <span className="patient-feature-icon">✓</span>
              <span>Book appointments easily</span>
            </div>

            <div>
              <span className="patient-feature-icon">✓</span>
              <span>Chat with your doctor</span>
            </div>

            <div>
              <span className="patient-feature-icon">✓</span>
              <span>Keep your care organized</span>
            </div>
          </div>
        </div>

        <div className="patient-visual-bottom">
          <span className="patient-status-dot"></span>
          Your health journey, made simpler.
        </div>

        <div className="patient-decoration patient-decoration-one"></div>
        <div className="patient-decoration patient-decoration-two"></div>
      </section>

      <section className="patient-login-main">
        <div className="patient-login-top">
          <span>PATIENT PORTAL</span>
          <Link to="/login">← All login options</Link>
        </div>

        <div className="patient-login-content">
          <div className="patient-login-heading">
            <div className="patient-login-heading-icon">♡</div>

            <p className="patient-login-eyebrow">
              WELCOME BACK
            </p>

            <h2>Your health journey continues here.</h2>

            <p>
              Sign in to manage appointments and connect with your doctor.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="patient-login-form">
            <div className="patient-login-field">
              <label htmlFor="patient-email">Email address</label>

              <input
                id="patient-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="patient-login-field">
              <label htmlFor="patient-password">Password</label>

              <div className="patient-password-wrap">
                <input
                  id="patient-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="patient-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p className="patient-login-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="patient-login-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in to your account"}
              {!loading && <span>→</span>}
            </button>
          </form>

          <div className="patient-login-security">
            <span>♡</span>
            <p>
              Your account matters. Keep your login credentials private
              and access your personal healthcare space securely.
            </p>
          </div>

          <div className="patient-login-signup">
            New to MedQueue?
            <Link to="/signup/patient"> Create patient account</Link>
          </div>
        </div>

        <footer className="patient-login-footer">
          <span>© {new Date().getFullYear()} MedQueue</span>
          <span>Care that connects.</span>
        </footer>
      </section>
    </main>
  );
}



