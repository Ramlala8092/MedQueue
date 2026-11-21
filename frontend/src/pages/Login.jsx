
// import { Link } from "react-router-dom";

// export default function Login() {
//   return (
//     <main className="signup-page">
//       <p className="eyebrow">WELCOME BACK</p>
//       <h1>Login to MedQueue</h1>
//       <p>Choose your account type to continue.</p>

//       <div className="signup-options">
//         <Link to="/login/doctor" className="signup-option">
//           <span className="signup-icon">＋</span>
//           <h2>I'm a Doctor</h2>
//           <p>Access your patients and doctor dashboard.</p>
//           <span>Continue →</span>
//         </Link>

//         <Link to="/login/patient" className="signup-option">
//           <span className="signup-icon">♡</span>
//           <h2>I'm a Patient</h2>
//           <p>Access your appointments and patient dashboard.</p>
//           <span>Continue →</span>
//         </Link>
//       </div>

//       <Link to="/signup" className="back-link">
//         Don't have an account? Signup
//       </Link>
//     </main>
//   );
// }



import { Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  return (
    <main className="account-login-page">
      <header className="account-login-header">
        <Link to="/" className="account-login-brand">
          <img src="/image/logo.png" alt="MedQueue Logo" className="brand-logo" style={{ width: "39px", height: "39px" }} />
          <span>MedQueue</span>
        </Link>

        <Link to="/" className="account-home-link">
          Back to home ↗
        </Link>
      </header>

      <section className="account-login-content">
        <div className="account-login-intro">
          <span className="account-login-eyebrow">
            YOUR HEALTHCARE, CONNECTED
          </span>

          <h1>
            Welcome back to <span>MedQueue.</span>
          </h1>

          <p>
            Choose your account type to access your personalized
            healthcare experience.
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
              Manage your appointments, connect with patients,
              and access your professional dashboard.
            </p>

            <Link to="/login/doctor" className="account-card-link">
              <span>Continue as Doctor</span>
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
              Book appointments with trusted doctors, chat with
              your care team, and manage your health in one place.
            </p>

            <Link to="/login/patient" className="account-card-link">
              <span>Continue as Patient</span>
              <span className="account-link-arrow">→</span>
            </Link>

            <div className="account-card-decoration patient-card-decoration">
              ♡
            </div>
          </article>
        </div>

        <div className="account-login-signup">
          <span>New to MedQueue?</span>
          <Link to="/signup">Create your account <span>↗</span></Link>
        </div>

        <div className="account-login-trust">
          <span className="account-trust-dot"></span>
          A simpler way to stay connected to your healthcare.
        </div>
      </section>

      <footer className="account-login-footer">
        <span>© {new Date().getFullYear()} MedQueue</span>
        <span>Healthcare, connected.</span>
      </footer>
    </main>
  );
}


