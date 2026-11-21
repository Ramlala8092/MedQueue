
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getHomeDoctors, getHealth } from "./services/api";
import Footer from "./component/Footer";
import Navbar from "./component/Navbar.jsx";
import MedQueueShowcase from "./component/MedQueueShowCase.jsx";


const faqData = [
  {
    question: "What is MedQueue?",
    answer:
      "MedQueue is an online healthcare platform that connects patients with doctors. Patients can find doctors, book appointments, consult online where available and access digital prescriptions when provided.",
  },
  {
    question: "How can I book an appointment on MedQueue?",
    answer:
      "Browse available doctors, check their profiles and specializations, select a suitable doctor, and choose an available date and time to book your appointment.",
  },
  {
    question: "Are doctors on MedQueue verified?",
    answer:
      "Yes. Doctors listed as approved on MedQueue go through an admin verification process before their profiles become available to patients.",
  },
  {
    question: "Can I consult a doctor online?",
    answer:
      "Yes. You can connect with available doctors through online chat and video consultation features, depending on the services offered by the doctor.",
  },
  {
    question: "How can I register as a doctor?",
    answer:
      "Choose Doctor Signup, complete your profile and upload the required qualification and medical registration documents. Your profile will be reviewed by the MedQueue admin.",
  },
  {
    question: "Can I cancel my appointment?",
    answer:
      "You can check your appointment details and available cancellation options from your patient account. Cancellation is subject to the applicable appointment policy.",
  },
  {
    question: "Can I get a digital prescription?",
    answer:
      "Yes. After consultation, your doctor can provide a digital prescription when applicable. You can access it through the available prescription feature.",
  },
];




export default function Home() {
  const [health, setHealth] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");
  const [activeFaq, setActiveFaq] = useState(0);
  const navigate = useNavigate();

   useEffect(() => {
  async function loadData() {
    try {
      const [healthResult, doctorsResult] = await Promise.all([
        getHealth(),
        getHomeDoctors(),
      ]);

      setHealth(healthResult);
      setDoctors(doctorsResult.doctors || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  }

  loadData();
}, []);

// Scroll Reveal Animation
useEffect(() => {
  const revealElements = document.querySelectorAll(
    ".doctor-card, .health-concern-card, .how-step-card, .section-heading, .health-concerns-header, .how-works-heading"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show-on-scroll");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealElements.forEach((element) => {
    observer.observe(element);
  });

  return () => observer.disconnect();
}, [doctors]);
  return (
    <>
      <div className="app-shell">
        <Navbar />

        <main>
          <section className="hero">
            <div className="hero-copy">
              <p className="eyebrow">CARE THAT FITS YOUR LIFE</p>

              <h1>
                Healthcare starts with the <span>right doctor</span>
              </h1>

              <p className="hero-description">
                Find doctors, explore their specialties, and get ready to book
                your appointment — all in one place.
              </p>

              <Link className="primary-button" to="/doctors">
                 Explore doctors <span>→</span>
              </Link>

              
            </div>

            <div className="hero-card" aria-label="Appointment preview">
              <div className="hero-card-top">
                {/* <span>YOUR HEALTH, IN FOCUS</span> */}
                {/* <span className="heart">♡</span> */}
              </div>

              <div className="illustration">
                <div className="circle circle-one"></div>
                <div className="circle circle-two"></div>

                <div className="doctor-illustration">
                  <div className="doctor-head"></div>
                  <div className="doctor-neck"></div>
                  <div className="doctor-coat">
                    <div className="coat-shirt"></div>
                    <div className="stethoscope"></div>
                  </div>
                </div>

                {/* <div className="floating-note">
                  <span className="note-icon">✓</span>
                  <div>
                    <strong>Care made easy</strong>
                    <small>One step at a time</small>
                  </div>
                </div> */}
              </div>

              {/* <div className="hero-card-footer">
                <span className="footer-icon">✚</span>
                <div>
                  <strong>Make time for your health</strong>
                  <small>Start by finding a doctor</small>
                </div>
              </div> */}
            </div>
          </section>

          {/* <section className="status-strip" aria-live="polite">
            <div>
              <span className="status-dot" />
              <strong>Backend connection</strong>
            </div>

            {error ? (
              <span className="connection-error">{error}</span>
            ) : health ? (
              <span className="connection-ok">
                API online · Database {health.database}
              </span>
            ) : (
              <span className="connection-loading">
                Checking connection…
              </span>
            )}
          </section> */}

          <section className="doctors-section" id="doctors">
            <div className="section-heading">
              <div>
                <p className="eyebrow">YOUR CARE TEAM</p>
                <h2>Meet our <span className="colo">doctors</span></h2>
              </div>

              {/* <span className="doctor-count">
                {doctors.length} doctors
              </span> */}
            </div>

            {error ? (
              <div className="empty-state">
                <h3>Could not connect yet</h3>
                <p>
                  Start the backend and make sure MongoDB is running, then
                  refresh this page.
                </p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">＋</div>
                <h3>Your doctor directory starts here</h3>
                <p>
                  Once approved doctor records are available, they will appear
                  in this section.
                </p>
              </div>
            ) : (
              <div className="doctor-grid">
                {doctors.map((doctor) => (
                  <article className="doctor-card" key={doctor._id}>
                    {doctor.profileImage ? (
                      <img
                        src={
                          doctor.profileImage.startsWith("/uploads/")
                            ? `http://localhost:5000${doctor.profileImage}`
                            : doctor.profileImage
                        }
                        alt={`Dr. ${doctor.name}`}
                        style={{
                          width: "100%",
                          height: "220px",
                          objectFit: "cover",
                          objectPosition: "center 25%",
                          borderRadius: "16px",
                          display: "block",
                          marginBottom: "18px",
                          backgroundColor: "#f0fdfa",
                        }}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "220px",
                          borderRadius: "16px",
                          marginBottom: "18px",
                          background:
                            "linear-gradient(135deg, #ccfbf1, #e0f2fe)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "64px",
                          fontWeight: "700",
                          color: "#0f766e",
                        }}
                      >
                        {doctor.name?.charAt(0)?.toUpperCase() || "D"}
                      </div>
                    )}

                    <div>
                      <h3>Dr. {doctor.name}</h3>
                      <p className="specialty">{doctor.specialization}</p>
                    </div>

                    <p className="doctor-meta">
                      {doctor.qualification || "Medical professional"}
                      {" · "}
                      {doctor.experienceYears || 0} years experience
                    </p>

                    <div className="doctor-card-bottom">
                      <span>
                        📍{" "}
                        {doctor.address ||
                          doctor.city ||
                          "Location not set"}
                      </span>

                      <strong>₹{doctor.consultationFee ?? 0}</strong>
                    </div>

                    {/* <button
                      className="primary-button"
                      type="button"
                      onClick={() => {
                        if (!localStorage.getItem("token")) {
                          navigate("/login/patient");
                          return;
                        }

                        navigate(`/book-appointment/${doctor._id}`);
                      }}
                    >
                      View profile →
                    </button> */}
                  </article>
                ))}
              </div>
            )}
          </section>
          
          {/* HEALTH CONCERNS SECTION */}
          <section className="health-concerns-section">
            <div className="health-concerns-container">

              <div className="health-concerns-header">
                <div>
                  <h2>Find the Right Care <span className="colo">for Your Health</span></h2>
                  <p>
                    Connect with trusted doctors for your everyday health concerns
                  </p>
                </div>

                
              </div>

              <div className="health-concerns-grid">

                <a href="#doctors" className="health-concern-card">
                  <div className="health-concern-icon icon-women">
                    <svg viewBox="0 0 100 100" fill="none">
                      <path d="M50 24 C32 18 27 37 35 48 C40 56 44 59 50 65 C56 59 60 56 65 48 C73 37 68 18 50 24Z"
                        stroke="#777B99" strokeWidth="4" strokeLinecap="round"/>
                      <path d="M50 64 L50 84" stroke="#F47D86" strokeWidth="10" strokeLinecap="round"/>
                      <circle cx="27" cy="40" r="9" fill="#50C6DC"/>
                      <circle cx="73" cy="40" r="9" fill="#50C6DC"/>
                      <path d="M27 40 L37 48 M73 40 L63 48" stroke="#777B99" strokeWidth="3"/>
                    </svg>
                  </div>
                  <h3>Women's Health</h3>
                  <p>Period, pregnancy & hormonal care</p>
                  <span>CONSULT NOW </span>
                </a>

                <a href="#doctors" className="health-concern-card">
                  <div className="health-concern-icon icon-skin">
                    <svg viewBox="0 0 100 100" fill="none">
                      <path d="M29 23 Q50 8 70 27 Q87 46 73 75 Q63 91 42 83 Q18 72 23 46Z"
                        fill="#F4C5A9"/>
                      <path d="M25 44 Q15 16 45 14 Q77 8 84 42 L78 60 Q66 52 61 38 Q48 48 25 44Z"
                        fill="#65677E"/>
                      <circle cx="43" cy="54" r="4" fill="#F27C86"/>
                      <circle cx="57" cy="62" r="4" fill="#F27C86"/>
                      <circle cx="40" cy="68" r="3" fill="#F27C86"/>
                    </svg>
                  </div>
                  <h3>Skin & Hair Care</h3>
                  <p>Acne, pimples & skin problems</p>
                  <span>CONSULT NOW</span>
                </a>

                <a href="#doctors" className="health-concern-card">
                  <div className="health-concern-icon icon-men">
                    <svg viewBox="0 0 100 100" fill="none">
                      <circle cx="40" cy="58" r="19" stroke="#F28B85" strokeWidth="8"/>
                      <circle cx="62" cy="36" r="19" stroke="#A981B8" strokeWidth="8"/>
                      <path d="M76 13 L89 13 L89 27 M89 13 L69 33"
                        stroke="#A981B8" strokeWidth="7" strokeLinecap="round"/>
                      <path d="M40 82 V94 M34 88 H46"
                        stroke="#F28B85" strokeWidth="6" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h3>Men's Health</h3>
                  <p>Personal wellness & health concerns</p>
                  <span>CONSULT NOW</span>
                </a>

                <a href="#doctors" className="health-concern-card">
                  <div className="health-concern-icon icon-cold">
                    <svg viewBox="0 0 100 100" fill="none">
                      <path d="M34 23 Q18 12 34 8 Q52 2 65 15 Q84 16 81 41 Q78 57 62 62 L36 57 Q24 43 34 23Z"
                        fill="#65677E"/>
                      <path d="M35 62 Q20 68 17 91 H85 Q78 67 62 62Z"
                        fill="#4CC5DC"/>
                      
                    </svg>
                  </div>
                  <h3>Cold, Cough & Fever</h3>
                  <p>Flu, infections & seasonal illness</p>
                  <span>CONSULT NOW</span>
                </a>

                <a href="#doctors" className="health-concern-card">
                  <div className="health-concern-icon icon-child">
                    <svg viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="34" r="22" fill="#FFC080"/>
                      <circle cx="42" cy="32" r="3" fill="#30364A"/>
                      <circle cx="58" cy="32" r="3" fill="#30364A"/>
                      <path d="M43 44 Q50 51 57 44"
                        stroke="#F18C83" strokeWidth="3" strokeLinecap="round"/>
                      <path d="M28 73 Q50 53 72 73 L84 94 H16Z"
                        fill="#A783B9"/>
                      <path d="M40 61 L50 75 L60 61"
                        fill="#F28C91"/>
                    </svg>
                  </div>
                  <h3>Child Healthcare</h3>
                  <p>Baby care & children's health</p>
                  <span>CONSULT NOW</span>
                </a>

                <a href="#doctors" className="health-concern-card">
                  <div className="health-concern-icon icon-mental">
                    <svg viewBox="0 0 100 100" fill="none">
                      <path d="M50 29 C30 8 10 29 21 49 C29 66 50 83 50 83 C50 83 71 66 79 49 C90 29 70 8 50 29Z"
                        fill="#F48278"/>
                      <path d="M50 30 V65 M33 47 H67"
                        stroke="white" strokeWidth="9" strokeLinecap="round"/>
                       
                    </svg>
                  </div>
                  <h3>Mental Wellness</h3>
                  <p>Stress, anxiety & emotional health</p>
                  <span>CONSULT NOW</span>
                </a>

              </div>
            </div>
          </section>
          
{/* HOW MEDQUEUE WORKS */}

<section className="how-medqueue-works">
  <div className="how-works-container">

    <div className="how-works-heading">
      <span className="how-works-label">
         How MedQueue Works
      </span>

      <h2>
        Get Care in 3<span className="colo"> Simple Steps</span>
      </h2>

      <p>
        Find the right doctor, book your appointment, and consult
        online or in person — all in one place with MedQueue.
      </p>
    </div>

    <div className="how-works-grid">

      {/* STEP 1 */}
      <div className="how-step-card">

        <div className="step-illustration">
          <svg viewBox="0 0 320 210" fill="none">
            {/* <circle cx="160" cy="105" r="90" fill="#E4F5EC"/> */}

            {/* Laptop */}
            <rect x="54" y="38" width="190" height="132"
              rx="10" fill="#123C3C"/>
            <rect x="61" y="45" width="176" height="117"
              rx="5" fill="#F5FBF8"/>
            <path d="M61 54 Q61 45 70 45 H228 Q237 45 237 54 V60 H61Z"
              fill="#16A477"/>
            <circle cx="72" cy="52" r="2" fill="white"/>
            <rect x="82" y="50" width="65" height="4" rx="2" fill="#B9E9D5"/>

            {/* Doctor profiles */}
            <rect x="78" y="76" width="38" height="37" rx="5" fill="#C8F0DF"/>
            <circle cx="97" cy="88" r="9" fill="#E9B99E"/>
            <path d="M83 108 Q97 89 111 108" fill="#138C70"/>

            <rect x="126" y="81" width="76" height="6" rx="3" fill="#75BFA5"/>
            <rect x="126" y="93" width="60" height="5" rx="3" fill="#D5E9E1"/>

            <rect x="78" y="120" width="38" height="32" rx="5" fill="#C8F0DF"/>
            <circle cx="97" cy="130" r="8" fill="#E6B69B"/>
            <path d="M83 149 Q97 132 111 149" fill="#159A7A"/>

            <rect x="126" y="124" width="76" height="6" rx="3" fill="#75BFA5"/>
            <rect x="126" y="136" width="58" height="5" rx="3" fill="#D5E9E1"/>

            {/* Search icon */}
            <circle cx="229" cy="137" r="27" fill="white" stroke="#183E3E" strokeWidth="7"/>
            <path d="M248 157 L272 182" stroke="#183E3E" strokeWidth="10" strokeLinecap="round"/>
            <path d="M221 137 L227 143 L238 129"
              stroke="#07976C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>

            {/* <path d="M37 57 L23 47 M33 72 L16 70"
              stroke="#07885D" strokeWidth="5" strokeLinecap="round"/> */}

            {/* <path d="M55 176 H250 L267 182 H42Z" fill="#9DC8B9"/> */}
          </svg>
        </div>

        <h3>Find a Doctor</h3>
        <p>
          Search and choose a verified doctor based on your health
          needs, specialization, and preference.
        </p>
      </div>

      {/* STEP CONNECTOR */}
      <div className="step-connector">
        {/* <svg viewBox="0 0 100 35" fill="none">
          <path d="M3 20 Q45 -5 85 20"
            stroke="#07885D" strokeWidth="3"
            strokeDasharray="8 6" strokeLinecap="round"/>
          <path d="M76 10 L87 20 L74 24"
            stroke="#07885D" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg> */}
      </div>

      {/* STEP 2 */}
      <div className="how-step-card">

        <div className="step-illustration">
          <svg viewBox="0 0 320 210" fill="none">
            {/* <circle cx="160" cy="105" r="90" fill="#E4F5EC"/> */}

            {/* Calendar */}
            <rect x="58" y="52" width="190" height="126"
              rx="16" fill="#F7FBF9" stroke="#183E3E" strokeWidth="5"/>

            <path d="M58 68 Q58 52 74 52 H232 Q248 52 248 68 V83 H58Z"
              fill="#07976C"/>

            {/* Calendar rings */}
            {/* <path d="M88 40 V68 M119 40 V68 M150 40 V68 M181 40 V68 M212 40 V68"
              stroke="#183E3E" strokeWidth="8" strokeLinecap="round"/> */}

            {/* Calendar dates */}
            {Array.from({ length: 15 }, (_, i) => (
              <rect
                key={i}
                x={80 + (i % 5) * 32}
                y={96 + Math.floor(i / 5) * 26}
                width="23"
                height="19"
                rx="4"
                fill={i === 7 ? "#07976C" : "#E0EAE6"}
              />
            ))}

            <path d="M183 130 L190 137 L203 121"
              stroke="white" strokeWidth="5"
              strokeLinecap="round" strokeLinejoin="round"/>

            {/* Clock */}
            <circle cx="236" cy="155" r="35"
              fill="white" stroke="#183E3E" strokeWidth="7"/>
            <path d="M236 133 V155 L250 163"
              stroke="#183E3E" strokeWidth="6" strokeLinecap="round"/>

            {/* <path d="M37 61 L23 50 M34 77 L16 74"
              stroke="#07885D" strokeWidth="5" strokeLinecap="round"/> */}

            {/* <path d="M52 183 H260" stroke="#9DC8B9" strokeWidth="4"/> */}
          </svg>
        </div>

        <h3>Book an Appointment</h3>
        <p>
          Select a convenient date and time and confirm your
          appointment in just a few clicks.
        </p>
      </div>

      {/* STEP CONNECTOR */}
      <div className="step-connector">
        {/* <svg viewBox="0 0 100 35" fill="none">
          <path d="M3 20 Q45 -5 85 20"
            stroke="#07885D" strokeWidth="3"
            strokeDasharray="8 6" strokeLinecap="round"/>
          <path d="M76 10 L87 20 L74 24"
            stroke="#07885D" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg> */}
      </div>

      {/* STEP 3 */}
      <div className="how-step-card">

        <div className="step-illustration">
          <svg viewBox="0 0 320 210" fill="none">
            {/* <circle cx="160" cy="105" r="90" fill="#E4F5EC"/> */}

            {/* Video screen */}
            <rect x="40" y="42" width="230" height="132"
              rx="12" fill="#173F3D"/>
            <rect x="48" y="50" width="214" height="116"
              rx="5" fill="#E9F5EF"/>

            {/* Doctor video */}
            {/* <rect x="57" y="59" width="196" height="100"
              rx="5" fill="#D5EAE0"/> */}
            <circle cx="145" cy="91" r="23" fill="#D9AA8C"/>
            <path d="M121 91 Q120 60 147 62 Q174 65 169 93 L162 82 Q143 89 128 79Z"
              fill="#263A39"/>
            <path d="M104 151 Q106 110 145 110 Q184 110 188 151"
              fill="white"/>
            <path d="M127 113 L145 135 L163 113"
              fill="#0A9871"/>
            <path d="M133 117 L145 130 L157 117"
              stroke="#0A9871" strokeWidth="4"/>

            {/* Video call buttons */}
            <circle cx="115" cy="151" r="11" fill="#078E69"/>
            <path d="M115 144 V153 M111 151 Q115 160 119 151"
              stroke="white" strokeWidth="2" strokeLinecap="round"/>

            <circle cx="151" cy="151" r="11" fill="#E75B58"/>
            <path d="M145 149 L157 153 M145 153 L157 149"
              stroke="white" strokeWidth="2" strokeLinecap="round"/>

            <circle cx="187" cy="151" r="11" fill="#078E69"/>
            <rect x="182" y="147" width="10" height="7"
              rx="2" stroke="white" strokeWidth="2"/>

            {/* Stand */}
            {/* <path d="M115 176 H195 L210 183 H100Z" fill="#9DC8B9"/> */}

            {/* <path d="M284 63 L298 52 M286 78 L303 75"
              stroke="#07885D" strokeWidth="5" strokeLinecap="round"/> */}
          </svg>
        </div>

        <h3>Consult & Get Care</h3>
        <p>
          Meet your doctor online through chat or video, get expert
          advice, and receive a digital prescription.
        </p>
      </div>

    </div>

    {/* FEATURES STRIP */}
    {/* <div className="how-works-features">

      <div className="how-feature">
        <span>♡</span>
        <strong>Verified Doctors</strong>
      </div>

      <div className="how-feature">
        <span>▦</span>
        <strong>Easy Booking</strong>
      </div>

      <div className="how-feature">
        <span>▣</span>
        <strong>Online Consultation</strong>
      </div>

      <div className="how-feature">
        <span>▤</span>
        <strong>Digital Prescription</strong>
      </div>

    </div> */}

  </div>
</section>
{/* MEDQUEUE SIX SCROLL SHOWCASE */}
<MedQueueShowcase />

{/* ==================================
    MEDQUEUE FAQ SECTION
================================== */}

<section className="medqueue-faq">
  <div className="faq-container">

    {/* LEFT CONTENT */}
    <div className="faq-left">


      <h2>
        Frequently
        <br />
        Asked <span>Questions</span>
      </h2>

      <p className="faq-description">
        Have questions about MedQueue? Find simple answers
        to help you understand our healthcare platform.
      </p>

      {/* MEDQUEUE ROBOT - INLINE SVG */}
      {/* <div className="faq-robot">
        <svg viewBox="0 0 300 340" fill="none"
          xmlns="http://www.w3.org/2000/svg">

          {/* Antenna *
          <path d="M85 76 L72 29 M215 76 L228 29"
            stroke="#263C3A" strokeWidth="7" strokeLinecap="round"/>
          <circle cx="72" cy="24" r="9" fill="#08A76B"/>
          <circle cx="228" cy="24" r="9" fill="#08A76B"/>

          {/* Head *
          <rect x="55" y="48" width="190" height="140"
            rx="58" fill="#F3F6F7" stroke="#AAB8B8" strokeWidth="4"/>

          {/* Face *
          <rect x="70" y="64" width="160" height="105"
            rx="45" fill="#172B2C"/>

          {/* Medical cross *
          <rect x="132" y="42" width="36" height="20" rx="7" fill="#08A76B"/>
          <path d="M150 45 V59 M143 52 H157"
            stroke="white" strokeWidth="4" strokeLinecap="round"/>

          {/* Eyes *
          <path d="M108 112 Q119 95 131 112"
            stroke="#12D66D" strokeWidth="8" strokeLinecap="round"/>
          <path d="M169 112 Q181 95 192 112"
            stroke="#12D66D" strokeWidth="8" strokeLinecap="round"/>

          {/* Smile *
          <path d="M130 137 Q150 153 170 137"
            stroke="#12D66D" strokeWidth="6" strokeLinecap="round"/>

          {/* Ear pieces *
          <rect x="36" y="93" width="22" height="65" rx="11" fill="#08A76B"/>
          <rect x="242" y="93" width="22" height="65" rx="11" fill="#08A76B"/>
          <rect x="41" y="110" width="12" height="30" rx="6" fill="#D9F6E9"/>
          <rect x="247" y="110" width="12" height="30" rx="6" fill="#D9F6E9"/>

          {/* Neck *
          <rect x="130" y="185" width="40" height="28" rx="8" fill="#657677"/>

          {/* Body *
          <path d="M82 218 Q150 190 218 218 L235 310 Q150 337 65 310Z"
            fill="#F0F4F4" stroke="#AAB8B8" strokeWidth="4"/>

          {/* Arms *
          <path d="M82 230 Q48 242 42 277"
            stroke="#B8C3C4" strokeWidth="22" strokeLinecap="round"/>
          <path d="M218 230 Q252 242 258 277"
            stroke="#B8C3C4" strokeWidth="22" strokeLinecap="round"/>

          <circle cx="42" cy="280" r="15" fill="#08A76B"/>
          <circle cx="258" cy="280" r="15" fill="#08A76B"/>

          {/* Chest *
          <rect x="100" y="226" width="100" height="72"
            rx="17" fill="white" stroke="#D5DEDE" strokeWidth="3"/>

          <path d="M150 236 V262 M137 249 H163"
            stroke="#08A76B" strokeWidth="8" strokeLinecap="round"/>

          <path d="M111 277 H189"
            stroke="#D5DEDE" strokeWidth="3" strokeLinecap="round"/>

          <text x="150" y="291" textAnchor="middle"
            fontSize="11" fontWeight="bold" fill="#173B36">
            MedQueue
          </text>

          {/* Legs *
          <path d="M112 309 L105 337 M188 309 L195 337"
            stroke="#657677" strokeWidth="20" strokeLinecap="round"/>
          <path d="M91 338 H120 M180 338 H209"
            stroke="#08A76B" strokeWidth="13" strokeLinecap="round"/>
        </svg>
      </div> */}
      <div className="faq-image">
  <img
    src="/image/roboimage.png"
    alt="MedQueue healthcare"
  />
</div>

    </div>

    {/* RIGHT FAQ QUESTIONS */}
    <div className="faq-right">

      {faqData.map((faq, index) => (
        <div
          className={`faq-item ${activeFaq === index ? "active" : ""}`}
          key={index}
        >

          <button
            type="button"
            className="faq-question"
            onClick={() =>
              setActiveFaq(activeFaq === index ? null : index)
            }
            aria-expanded={activeFaq === index}
          >
            <span>{faq.question}</span>

            <span className="faq-toggle">
              {activeFaq === index ? "−" : "+"}
            </span>
          </button>

          <div
            className={`faq-answer ${
              activeFaq === index ? "show" : ""
            }`}
          >
            <p>{faq.answer}</p>
          </div>

        </div>
      ))}

    </div>

  </div>
</section>

        </main>
      </div>

      <Footer />
    </>
  );
}

