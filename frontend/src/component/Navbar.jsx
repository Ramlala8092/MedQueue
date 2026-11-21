import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const profilePath = user?.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard";
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/" aria-label="MedQueue home">
        <img src="/image/logo.png" alt="MedQueue Logo" className="brand-logo" />
        <span>MedQueue</span>
      </Link>
      <nav aria-label="Main navigation">
        <Link to="/doctors">Find doctors</Link>
        {!isAuthenticated ? (
          <>
            <Link className="nav-button" to="/signup">Signup</Link>
            <Link className="nav-button" to="/login">Login</Link>
          </>
        ) : (
          <>
            <Link
              to={profilePath}
              aria-label="Open profile"
              title="My Profile"
              style={{
                width: "38px", height: "38px", minWidth: "38px",
                borderRadius: "50%", display: "inline-flex",
                alignItems: "center", justifyContent: "center",
                background: "#0f766e", color: "#fff",
                fontWeight: 800, fontSize: "15px", textDecoration: "none",
              }}
            >
              {initial}
            </Link>
            <button type="button" className="nav-button" onClick={handleLogout}
              style={{ border: 0, cursor: "pointer", font: "inherit" }}>
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
