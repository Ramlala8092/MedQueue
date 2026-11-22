
// import { useNavigate } from "react-router-dom";
// import { useState } from "react";
// import "./DoctorLogin.css";


// export default function DoctorLogin() {
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
//           role: "doctor",
//         }),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.message || "Login failed");
//       }

//       localStorage.setItem("token", result.token);
//       localStorage.setItem("user", JSON.stringify(result.user));

//       navigate("/doctor/dashboard");
//     } catch (err) {
//       setError(err.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//      return (
//   <main className="doctor-login-page">
//     <div className="doctor-login-card">
//       <div className="doctor-login-icon">✚</div>

//       <p className="doctor-login-eyebrow">MEDQUEUE FOR DOCTORS</p>
//       <h1>Welcome Back!</h1>
//       <p className="doctor-login-subtitle">
//         Sign in to manage your patients and appointments.
//       </p>

//       <form onSubmit={handleSubmit} className="doctor-login-form">
//         <div className="doctor-login-field">
//           <label htmlFor="email">Email Address</label>
//           <input
//             id="email"
//             name="email"
//             type="email"
//             placeholder="doctor@example.com"
//             autoComplete="email"
//             required
//           />
//         </div>

//         <div className="doctor-login-field">
//           <label htmlFor="password">Password</label>
//           <input
//             id="password"
//             name="password"
//             type="password"
//             placeholder="Enter your password"
//             autoComplete="current-password"
//             required
//           />
//         </div>

//         {error && <p className="doctor-login-error" role="alert">{error}</p>}

//         <button
//           type="submit"
//           className="doctor-login-button"
//           disabled={loading}
//         >
//           {loading ? "Signing in..." : "Sign In to Dashboard"}
//         </button>
//       </form>

//       <p className="doctor-login-footer">
//         Secure access for verified doctors
//       </p>
//     </div>
//   </main>
// );
// }








import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./DoctorLogin.css";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

export default function DoctorLogin() {
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
          role: "doctor",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      login(result.token, result.user);
      navigate("/doctor/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="doctor-login-page">
      <section className="doctor-login-visual">
        <Link to="/" className="doctor-brand">
          <img src="/image/logo.png" alt="MedQueue Logo" style={{ width: "39px", height: "39px", objectFit: "contain" }} />
          <span>MedQueue</span>
        </Link>

        <div className="doctor-visual-content">
          <span className="doctor-visual-label">
            YOUR PRACTICE. SIMPLIFIED.
          </span>

          <h1>
            Better care
            <br />
            starts with
            <br />
            <span>better connections.</span>
          </h1>

          <p>
            Manage appointments, connect with patients, and
            make every consultation count — all in one place.
          </p>

          <div className="doctor-visual-features">
            <div>
              <span className="doctor-feature-icon">✓</span>
              <span>Manage appointments</span>
            </div>

            <div>
              <span className="doctor-feature-icon">✓</span>
              <span>Connect with patients</span>
            </div>

            <div>
              <span className="doctor-feature-icon">✓</span>
              <span>Secure doctor portal</span>
            </div>
          </div>
        </div>

        <div className="doctor-visual-bottom">
          <span className="doctor-status-dot"></span>
          Healthcare management made simpler.
        </div>

        <div className="doctor-decoration doctor-decoration-one"></div>
        <div className="doctor-decoration doctor-decoration-two"></div>
      </section>

      <section className="doctor-login-main">
        <div className="doctor-login-top">
          <span>DOCTOR PORTAL</span>
          <Link to="/login">← All login options</Link>
        </div>

        <div className="doctor-login-content">
          <div className="doctor-login-heading">
            <div className="doctor-login-heading-icon">✚</div>

            <p className="doctor-login-eyebrow">
              WELCOME BACK, DOCTOR
            </p>

            <h2>Sign in to your account</h2>

            <p>
              Enter your details to access your professional dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="doctor-login-form">
            <div className="doctor-login-field">
              <label htmlFor="doctor-email">Email address</label>

              <input
                id="doctor-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="doctor-login-field">
              <label htmlFor="doctor-password">Password</label>

              <div className="doctor-password-wrap">
                <input
                  id="doctor-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="doctor-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p className="doctor-login-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="doctor-login-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in to dashboard"}
              {!loading && <span>→</span>}
            </button>
          </form>

          <div className="doctor-login-security">
            <span>♧</span>
            <p>
              Your account is protected. Secure access for verified doctors.
            </p>
          </div>

          <div className="doctor-login-signup">
            New to MedQueue?
            <Link to="/signup/doctor"> Create doctor account</Link>
          </div>
        </div>

        <footer className="doctor-login-footer">
          <span>© {new Date().getFullYear()} MedQueue</span>
          <span>Healthcare, connected.</span>
        </footer>
      </section>
    </main>
  );
}