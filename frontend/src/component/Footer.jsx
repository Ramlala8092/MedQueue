
import { Link } from "react-router-dom";
import "./Footer.css";

const patientLinks = [
  { label: "Find a Doctor", to: "/" },
  { label: "Book Appointment", to: "/" },
  { label: "Patient Login", to: "/login/patient" },
  { label: "Patient Signup", to: "/signup/patient" },
  { label: "My Appointments", to: "/patient/dashboard" },
  { label: "Health Resources", to: "/health-resources" },
  // { label: "Help Center", to: "/contact" },
];

const doctorLinks = [
  { label: "Join as a Doctor", to: "/signup/doctor" },
  { label: "Doctor Login", to: "/login/doctor" },
  { label: "Doctor Dashboard", to: "/doctor/dashboard" },
  { label: "Guidelines", to: "/doctor-guidelines" },
  { label: "Resources", to: "/doctor-resources" },
  // { label: "Help Center", to: "/contact" },
];

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Our Services", to: "/services" },
  { label: "How It Works", to: "/how-it-works" },
  // { label: "Blog", to: "/blog" },
];

const legalLinks = [
  { label: "Terms & Conditions", to: "/terms-and-conditions" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  // { label: "Refund Policy", to: "/refund-policy" },
  // { label: "Cookie Policy", to: "/cookie-policy" },
  // { label: "Disclaimer", to: "/disclaimer" },
];

function FooterLinks({ title, links }) {
  return (
    <div className="mq-footer-column">
      <h3>{title}</h3>
      <span className="mq-footer-heading-line"></span>

      <ul>
        {links.map((link) => (
          <li key={link.label}>
            <Link to={link.to}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({ href, label, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
      {children}
    </a>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mq-footer">
      {/* <section className="mq-newsletter">
        <div className="mq-newsletter-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="5"
              width="18"
              height="14"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.7"
            />
            <path
              d="m4 7 8 6 8-6"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="mq-newsletter-copy">
          <span>STAY UPDATED</span>
          <h2>Get the latest health tips and updates</h2>
          <p>
            Subscribe for health insights, doctor tips and platform updates.
          </p>
        </div>

        <form
          className="mq-newsletter-form"
          onSubmit={(event) => {
            event.preventDefault();

            const formData = new FormData(event.currentTarget);
            const email = formData.get("email");

            if (!email) return;

            window.location.href =
              "mailto:support@medqueue.com?subject=" +
              encodeURIComponent("MedQueue Newsletter Subscription") +
              "&body=" +
              encodeURIComponent(
                "Please add this email to the newsletter: " + email
              );
          }}
        >
          <div className="mq-newsletter-controls">
            <label className="mq-newsletter-input">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="m4 7 8 6 8-6"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>

              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                aria-label="Email address for newsletter"
                required
              />
            </label>

            <button type="submit">
              Subscribe <span>→</span>
            </button>
          </div>

          <p>We respect your privacy. No spam, ever.</p>
        </form>
      </section> */}

      <div className="mq-footer-main">
        <div className="mq-footer-brand">
          {/* <Link to="/" className="mq-footer-logo">
            <span className="mq-footer-logo-icon">✚</span>
            <span>MedQueue</span>
          </Link> */}
          <Link to="/" className="mq-footer-logo">
            <img
              src="/image/logo.png"
              alt="MedQueue Logo"
              className="mq-footer-logo-img"
            />
            <span>MedQueue</span>
          </Link>

          <p>
            Connecting patients and doctors for a healthier tomorrow.
          </p>

          <div className="mq-footer-socials">
            <SocialLink href="https://www.facebook.com/" label="Facebook">
              f
            </SocialLink>
            <SocialLink href="https://www.instagram.com/" label="Instagram">
              ◎
            </SocialLink>
            <SocialLink href="https://www.linkedin.com/" label="LinkedIn">
              in
            </SocialLink>
            <SocialLink href="https://www.youtube.com/" label="YouTube">
              ▶
            </SocialLink>
            <SocialLink href="https://x.com/" label="X">
              𝕏
            </SocialLink>
          </div>
        </div>

        <div className="mq-footer-links">
          <FooterLinks title="For Patients" links={patientLinks} />
          <FooterLinks title="For Doctors" links={doctorLinks} />
          <FooterLinks title="Quick Links" links={quickLinks} />
          <FooterLinks title="Legal" links={legalLinks} />
        </div>

        {/* <div className="mq-footer-contact">
          <h3>Contact Us</h3>
          <span className="mq-footer-heading-line"></span>

          <a
            href="mailto:support@medqueue.com"
            className="mq-footer-email"
          >
            <span className="mq-footer-contact-icon">@</span>
            <span>
              <strong>support@medqueue.com</strong>
              <small>We usually respond within 24 hours.</small>
            </span>
          </a>
        </div> */}
      </div>

      <div className="mq-footer-bottom">
        <p>© {currentYear} MedQueue. All rights reserved.</p>

        <div>
          <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/cookie-policy">Cookie Policy</Link>
          <Link to="/sitemap">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}