
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDoctors } from "../services/api";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar.jsx";
import "./Doctors.css";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All Specialties");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);

  const navigate = useNavigate();
  const doctorFaqs = [
  {
    question: "How can I find the right doctor on MedQueue?",
    answer:
      "Browse verified doctors, search by specialization, and compare qualifications and experience to find the right doctor for your healthcare needs.",
  },
  {
    question: "Are doctors on MedQueue verified?",
    answer:
      "Yes. Doctors go through a verification process where their professional information and submitted documents are reviewed before approval.",
  },
  {
    question: "How can I book an appointment with a doctor?",
    answer:
      "Select your preferred doctor, open their profile, choose an available date and time, and confirm your appointment.",
  },
  {
    question: "Can I consult a doctor online?",
    answer:
      "Yes. You can connect with doctors through online chat and video consultations from the comfort of your home.",
  },
  {
    question: "Can I see a doctor's qualification and experience?",
    answer:
      "Yes. You can view the doctor's specialization, qualifications, experience, consultation fee, and other available profile details.",
  },
  {
    question: "How much does a doctor consultation cost?",
    answer:
      "Consultation fees vary by doctor. You can check the fee on the doctor's profile before booking an appointment.",
  },
  {
    question: "Can I cancel my appointment?",
    answer:
      "You can check your appointment details in your patient account and follow the available cancellation instructions.",
  },
];

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const result = await getDoctors();
        setDoctors(result.doctors || []);
      } catch (err) {
        setError(err.message || "Could not load doctors");
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const specialties = [
    "All Specialties",
    ...new Set(doctors.map((d) => d.specialization).filter(Boolean)),
  ];

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesSearch =
        doctor.name?.toLowerCase().includes(search.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(search.toLowerCase()) ||
        doctor.qualification?.toLowerCase().includes(search.toLowerCase());

      const matchesSpecialty =
        specialty === "All Specialties" ||
        doctor.specialization === specialty;

      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, search, specialty]);

  const getImage = (path) => {
    if (!path) return "";
    return path.startsWith("/uploads/")
      ? `http://localhost:5000${path}`
      : path;
  };

  return (
    <>
      <div className="app-shell doctors-page">

        {/* Header */}
        <Navbar />

        
<section className="doctors-hero">
  <div className="doctors-hero-overlay"></div>

  <div className="doctors-hero-content">
    <h1>
      Find the Right Doctor
      <br />
      <span>For Your Better Health</span>
    </h1>

    <p>
      Connect with trusted and verified doctors through
      MedQueue. Explore specialists and find the right
      healthcare professional for your needs.
    </p>
  </div>

  <div className="doctors-hero-curve"></div>
</section>

        {/* Search and Filter */}
        <section className="doctors-directory">

          <div className="doctor-search-bar">
            <input
              type="text"
              placeholder="Search doctor, specialty or qualification..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            >
              {specialties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="directory-heading">
            <div>
              <h2>Available Doctors</h2>
              <p>Choose a doctor and book your appointment.</p>
            </div>

            {/* <span>{filteredDoctors.length} doctors found</span> */}
          </div>

          {loading ? (
            <div className="doctors-message">Loading doctors...</div>
          ) : error ? (
            <div className="doctors-message">{error}</div>
          ) : filteredDoctors.length === 0 ? (
            <div className="doctors-message">
              <h3>No doctors found</h3>
              <p>Try another name or specialization.</p>
            </div>
          ) : (
            <div className="directory-grid">
              {filteredDoctors.map((doctor) => (
                <article className="directory-card" key={doctor._id}>

                  {doctor.profileImage ? (
                    <img
                      className="directory-image"
                      src={getImage(doctor.profileImage)}
                      alt={`Dr. ${doctor.name}`}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="directory-placeholder">
                      {doctor.name?.charAt(0)?.toUpperCase() || "D"}
                    </div>
                  )}

                  <div className="directory-card-content">
                    {/* <span className="verified-label">
                      ✓ Verified Doctor
                    </span> */}

                    <h3>Dr. {doctor.name}</h3>

                    <p className="directory-specialty">
                      {doctor.specialization}
                    </p>

                    <div className="directory-details">
                      <p>
                        <strong>Qualification:</strong>{" "}
                        {doctor.qualification}
                      </p>

                      <p>
                        <strong>Experience:</strong>{" "}
                        {doctor.experienceYears} years
                      </p>

                      <p>
                        <strong>Location:</strong>{" "}
                        {doctor.address || doctor.city || "Not available"}
                      </p>
                    </div>

                    <div className="directory-card-bottom">
                      <div>
                        <small>Consultation Fee</small>
                        <strong>₹{doctor.consultationFee}</strong>
                      </div>

                      <button
                        onClick={() => {
                          if (!localStorage.getItem("token")) {
                            navigate("/login/patient");
                            return;
                          }

                          navigate(`/book-appointment/${doctor._id}`);
                        }}
                      >
                        Book Appointment →
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

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
            <rect x="54" y="38" width="190" height="132"
              rx="10" fill="#123C3C"/>
            <rect x="61" y="45" width="176" height="117"
              rx="5" fill="#F5FBF8"/>
            <path d="M61 54 Q61 45 70 45 H228 Q237 45 237 54 V60 H61Z"
              fill="#16A477"/>
            <circle cx="72" cy="52" r="2" fill="white"/>
            <rect x="82" y="50" width="65" height="4" rx="2" fill="#B9E9D5"/>

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

            <circle cx="229" cy="137" r="27" fill="white" stroke="#183E3E" strokeWidth="7"/>
            <path d="M248 157 L272 182" stroke="#183E3E" strokeWidth="10" strokeLinecap="round"/>
            <path d="M221 137 L227 143 L238 129"
              stroke="#07976C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h3>Find a Doctor</h3>
        <p>
          Search and choose a verified doctor based on your health
          needs, specialization, and preference.
        </p>
      </div>

      {/* STEP CONNECTOR */}
      <div className="step-connector"></div>

      {/* STEP 2 */}
      <div className="how-step-card">
        <div className="step-illustration">
          <svg viewBox="0 0 320 210" fill="none">
            <rect x="58" y="52" width="190" height="126"
              rx="16" fill="#F7FBF9" stroke="#183E3E" strokeWidth="5"/>

            <path d="M58 68 Q58 52 74 52 H232 Q248 52 248 68 V83 H58Z"
              fill="#07976C"/>

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

            <circle cx="236" cy="155" r="35"
              fill="white" stroke="#183E3E" strokeWidth="7"/>
            <path d="M236 133 V155 L250 163"
              stroke="#183E3E" strokeWidth="6" strokeLinecap="round"/>
          </svg>
        </div>

        <h3>Book an Appointment</h3>
        <p>
          Select a convenient date and time and confirm your
          appointment in just a few clicks.
        </p>
      </div>

      {/* STEP CONNECTOR */}
      <div className="step-connector"></div>

      {/* STEP 3 */}
      <div className="how-step-card">
        <div className="step-illustration">
          <svg viewBox="0 0 320 210" fill="none">
            <rect x="40" y="42" width="230" height="132"
              rx="12" fill="#173F3D"/>
            <rect x="48" y="50" width="214" height="116"
              rx="5" fill="#E9F5EF"/>

            <circle cx="145" cy="91" r="23" fill="#D9AA8C"/>
            <path d="M121 91 Q120 60 147 62 Q174 65 169 93 L162 82 Q143 89 128 79Z"
              fill="#263A39"/>
            <path d="M104 151 Q106 110 145 110 Q184 110 188 151"
              fill="white"/>
            <path d="M127 113 L145 135 L163 113"
              fill="#0A9871"/>
            <path d="M133 117 L145 130 L157 117"
              stroke="#0A9871" strokeWidth="4"/>

            <circle cx="115" cy="151" r="11" fill="#078E69"/>
            <path d="M115 144 V153 M111 151 Q115 160 119 151"
              stroke="white" strokeWidth="2" strokeLinecap="round"/>

            <circle cx="151" cy="151" r="11" fill="#E75B58"/>
            <path d="M145 149 L157 153 M145 153 L157 149"
              stroke="white" strokeWidth="2" strokeLinecap="round"/>

            <circle cx="187" cy="151" r="11" fill="#078E69"/>
            <rect x="182" y="147" width="10" height="7"
              rx="2" stroke="white" strokeWidth="2"/>
          </svg>
        </div>

        <h3>Consult & Get Care</h3>
        <p>
          Meet your doctor online through chat or video, get expert
          advice, and receive a digital prescription.
        </p>
      </div>

    </div>
  </div>
</section>

{/* DOCTORS FAQ SECTION */}

<section className="doctor-faq-section">
  <div className="doctor-faq-container">

    {/* LEFT SIDE */}
    <div className="doctor-faq-left">
      <h2>
        Frequently
        <br />
        Asked <span>Questions</span>
      </h2>

      <p>
        Have questions about finding doctors on MedQueue?
        Find simple answers to help you book appointments
        and get the care you need.
      </p>

      <div className="doctor-faq-image">
        <img
          src="/image/roboimage.png"
          alt="MedQueue FAQ Assistant"
        />
      </div>
    </div>

    {/* RIGHT SIDE */}
    <div className="doctor-faq-right">
      {doctorFaqs.map((faq, index) => (
        <div
          className={`doctor-faq-item ${
            activeFaq === index ? "active" : ""
          }`}
          key={index}
        >
          <button
            className="doctor-faq-question"
            onClick={() =>
              setActiveFaq(
                activeFaq === index ? null : index
              )
            }
            aria-expanded={activeFaq === index}
          >
            <span>{faq.question}</span>

            <span className="doctor-faq-icon">
              {activeFaq === index ? "−" : "+"}
            </span>
          </button>

          <div
            className={`doctor-faq-answer ${
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
      </div>

      <Footer />
    </>
  );
}