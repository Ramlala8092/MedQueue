
// import { Link } from "react-router-dom";

// export default function Signup() {
//   return (
//     <main className="signup-page">
//       <p className="eyebrow">JOIN MEDQUEUE</p>
//       <h1>Create your account</h1>
//       <p>Tell us how you want to use MedQueue.</p>

//       <div className="signup-options">
//         <Link to="/signup/doctor" className="signup-option">
//           <span className="signup-icon">＋</span>
//           <h2>I'm a Doctor</h2>
//           <p>Create your professional doctor account.</p>
//           <span>Continue →</span>
//         </Link>

//         <Link to="/signup/patient" className="signup-option">
//           <span className="signup-icon">♡</span>
//           <h2>I'm a Patient</h2>
//           <p>Find doctors and manage your appointments.</p>
//           <span>Continue →</span>
//         </Link>
//       </div>

//       <Link to="/" className="back-link">← Back to Home</Link>
//     </main>
//   );
// }



import { Link } from "react-router-dom";
import "./Signup.css";

export default function Signup() {
  return (
    <main className="account-login-page">
      <header className="account-login-header">
        <Link to="/" className="account-login-brand">
          <img src="/image/logo.png" alt="MedQueue Logo" className="brand-logo" style={{ width: "39px", height: "39px" }} />
          <span>MedQueue</span>
        </Link>

        <Link to="/login" className="account-home-link">
          Already registered? Sign in →
        </Link>
      </header>

      <section className="account-login-content signup-content">
        <div className="account-login-intro">
          <span className="account-login-eyebrow">
            JOIN MEDQUEUE
          </span>

          <h1>
            Create your <span>account.</span>
          </h1>

          <p>
            Choose how you want to use MedQueue and get started
            with a healthcare experience built around you.
          </p>
        </div>

        <div className="account-login-cards">
          <article className="account-login-card doctor-account-card">
            <div className="account-card-top">
              <div className="account-card-icon doctor-card-icon">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="account-card-number">01 / DOCTOR</span>
            </div>

            <h2>I'm a Doctor</h2>

            <p>
              Create your professional account, manage appointments,
              and connect with your patients.
            </p>

            <Link to="/signup/doctor" className="account-card-link">
              <span>Register as Doctor</span>
              <span className="account-link-arrow">→</span>
            </Link>

            <div className="account-card-decoration doctor-card-decoration">
              ✚
            </div>
          </article>

          <article className="account-login-card patient-account-card">
            <div className="account-card-top">
              <div className="account-card-icon patient-card-icon">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M20.8 8.8c0 5.1-8.8 10-8.8 10S3.2 13.9 3.2 8.8A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="account-card-number">02 / PATIENT</span>
            </div>

            <h2>I'm a Patient</h2>

            <p>
              Find trusted doctors, book appointments, and stay
              connected with your healthcare team.
            </p>

            <Link to="/signup/patient" className="account-card-link">
              <span>Register as Patient</span>
              <span className="account-link-arrow">→</span>
            </Link>

            <div className="account-card-decoration patient-card-decoration">
              ♡
            </div>
          </article>
        </div>

        <div className="account-login-signup">
          <span>Already have an account?</span>
          <Link to="/login">Sign in <span>↗</span></Link>
        </div>

        <div className="account-login-trust">
          <span className="account-trust-dot"></span>
          One platform to keep your healthcare connected.
        </div>
      </section>

      <footer className="account-login-footer">
        <span>© {new Date().getFullYear()} MedQueue</span>
        <span>Healthcare, connected.</span>
      </footer>
    </main>
  );
}

