
import { Link } from "react-router-dom";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar.jsx";
import { useEffect, useState, useRef } from "react";
import "./Services.css";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

export default function Services() {
  const [specialties, setSpecialties] = useState([]);
  const [specialtiesLoading, setSpecialtiesLoading] = useState(true);
  const [specialtiesError, setSpecialtiesError] = useState("");
  const specialtiesSliderRef = useRef(null);

  const scrollSpecialties = (direction) => {
    if (specialtiesSliderRef.current) {
      specialtiesSliderRef.current.scrollBy({
        left: direction * 320,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/doctors/specialties/unique`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Unable to load specialties"
          );
        }

        setSpecialties(result.doctors || []);
      } catch (error) {
        console.error("Specialties error:", error);
        setSpecialtiesError(
          "Unable to load doctor specialties."
        );
      } finally {
        setSpecialtiesLoading(false);
      }
    };

    fetchSpecialties();
  }, []);

  return (
    <div className="services-page">

      {/* HEADER */}
      <Navbar />

      {/* SERVICES HERO */}
      <main>

        {/* SERVICES HERO SECTION */}
        <section className="services-hero">

          <div className="services-hero-overlay"></div>

          <div className="services-hero-content">

            <h1>
              Healthcare services
              <br />
              <span>designed around you</span>
            </h1>

            <p>
              Discover trusted doctors, book appointments and connect
              with healthcare professionals. MedQueue makes your
              healthcare journey simpler and more convenient.
            </p>

          </div>

          <div className="services-hero-curve"></div>

        </section>
        <section className="healthcare-services">
          <div className="healthcare-heading">
            <span><h3 className="heading">OUR HEALTHCARE SERVICES</h3></span>
            <h2>
              Healthcare Services Designed for <strong>Your Needs</strong>
            </h2>
            <p>
              A complete range of digital healthcare services to connect patients
              and doctors, anytime and anywhere.
            </p>
          </div>

          <div className="healthcare-grid">

            <div className="healthcare-card">
              <div className="service-image">
                <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=900" alt="Doctor appointment" />
                <span className="service-icon">📅</span>
              </div>
              <div className="service-content">
                <h3>Doctor Appointment Booking</h3>
                <p>Find the right doctor for your needs and book appointments in just a few clicks.</p>
              </div>
            </div>

            <div className="healthcare-card">
              <div className="service-image">
                <img src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=900" alt="Video consultation" />
                <span className="service-icon">📹</span>
              </div>
              <div className="service-content">
                <h3>Online Video Consultation</h3>
                <p>Consult with qualified doctors from the comfort of your home.</p>
              </div>
            </div>

            <div className="healthcare-card">
              <div className="service-image">
                <img src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=900" alt="Doctor patient chat" />
                <span className="service-icon">💬</span>
              </div>
              <div className="service-content">
                <h3>Doctor-Patient Chat</h3>
                <p>Stay connected with your doctor through secure and real-time chat.</p>
              </div>
            </div>

            <div className="healthcare-card">
              <div className="service-image">
                <img src="https://images.unsplash.com/photo-1585435557343-3b092031a831?w=900" alt="Digital prescription" />
              </div>
              <div className="service-content">
                <h3>Digital Prescription</h3>
                <p>Get and access your medical prescriptions online, safely and anytime.</p>
                \      </div>
            </div>

            <div className="healthcare-card">
              <div className="service-image">
                <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=900" alt="Verified doctor" />
              </div>
              <div className="service-content">
                <h3>Verified Doctor Profiles</h3>
                <p>Explore detailed doctor profiles, qualifications, experience and specializations.</p>
              </div>
            </div>

            <div className="healthcare-card">
              <div className="service-image">
                <img src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=900" alt="Appointment management" />
                <span className="service-icon">🕒</span>
              </div>
              <div className="service-content">
                <h3>Appointment Management</h3>
                <p>View, reschedule and manage all your appointments in one place.</p>
              </div>
            </div>

          </div>
        </section>
        {/* SERVICES FOR PATIENTS */}
        <section className="patients-section">

          <div className="patients-heading">
            <span><h3 className="heading">SERVICES FOR PATIENTS</h3></span>
            <h2>Care Designed for <strong>Patients</strong></h2>
            <p>
              Simple, convenient and reliable healthcare services to manage your health better.
            </p>
          </div>

          <div className="patients-container">

            <div className="patients-image">
              <img
                src="/image/service3.jpg"
                alt="Patient using MedQueue"
              />
            </div>

            <div className="patients-right">

              <div className="patients-grid">

                <div className="patient-service">
                  <div className="patient-icon"> <i className="fa-solid fa-user-doctor"></i> </div>
                  <div>
                    <h3>Find the Right Doctor</h3>
                    <p>Explore doctor profiles and choose the right specialist.</p>
                  </div>
                </div>

                <div className="patient-service">
                  <div className="patient-icon"><i className="fa-solid fa-video"></i></div>
                  <div>
                    <h3>Online Consultation</h3>
                    <p>Connect with doctors through video consultations.</p>
                  </div>
                </div>

                <div className="patient-service">
                  <div className="patient-icon"><i className="fa-solid fa-calendar-check"></i></div>
                  <div>
                    <h3>Easy Appointment Booking</h3>
                    <p>Book your doctor appointments with just a few clicks.</p>
                  </div>
                </div>

                <div className="patient-service">
                  <div className="patient-icon"><i className="fa-solid fa-comments"></i></div>
                  <div>
                    <h3>Stay Connected</h3>
                    <p>Communicate with your doctor through secure chat.</p>
                  </div>
                </div>

                <div className="patient-service">
                  <div className="patient-icon"><i className="fa-solid fa-file-prescription"></i></div>
                  <div>
                    <h3>Access Prescriptions</h3>
                    <p>View and download your digital prescriptions anytime.</p>
                  </div>
                </div>

                <div className="patient-service">
                  <div className="patient-icon"><i className="fa-solid fa-layer-group"></i></div>
                  <div>
                    <h3>Manage Your Appointments</h3>
                    <p>Keep track of your upcoming and past appointments.</p>
                  </div>
                </div>

              </div>

              <Link to="/signup" className="patients-button">
                Get Started <span>→</span>
              </Link>

            </div>
          </div>
        </section>
        {/* SERVICES FOR DOCTORS */}
        <section className="doctors-section">

          <div className="doctors-container">

            <div className="doctors-left">

              <div className="doctors-heading">
                <span><h3 className="heading">Services for Doctors</h3></span>

                <h2>
                  Grow Your Practice with <strong>MedQueue</strong>
                </h2>

                <p>
                  A complete platform to manage your patients, appointments
                  and online consultations — all in one place.
                </p>
              </div>

              <div className="doctors-grid">

                <div className="doctor-service-card">
                  <div className="doctor-service-icon">
                    <i className="fa-solid fa-user-plus"></i>
                  </div>
                  <h3>Doctor Registration</h3>
                  <p>Sign up, get verified and start your practice online.</p>
                </div>

                <div className="doctor-service-card">
                  <div className="doctor-service-icon">
                    <i className="fa-solid fa-id-card"></i>
                  </div>
                  <h3>Manage Your Profile</h3>
                  <p>Showcase your qualification, experience and specialization.</p>
                </div>

                <div className="doctor-service-card">
                  <div className="doctor-service-icon">
                    <i className="fa-solid fa-calendar-check"></i>
                  </div>
                  <h3>Appointment Management</h3>
                  <p>View and manage patient appointments easily.</p>
                </div>

                <div className="doctor-service-card">
                  <div className="doctor-service-icon">
                    <i className="fa-solid fa-video"></i>
                  </div>
                  <h3>Online Consultation</h3>
                  <p>Consult with patients through secure video calls.</p>
                </div>

                <div className="doctor-service-card">
                  <div className="doctor-service-icon">
                    <i className="fa-solid fa-comments"></i>
                  </div>
                  <h3>Patient Communication</h3>
                  <p>Stay connected with patients through real-time chat.</p>
                </div>

                <div className="doctor-service-card">
                  <div className="doctor-service-icon">
                    <i className="fa-solid fa-folder-open"></i>
                  </div>
                  <h3>Patient Records</h3>
                  <p>Keep and access patient history and prescriptions securely.</p>
                </div>

              </div>

              <Link to="/signup" className="doctor-register-btn">
                Register as a Doctor <span>→</span>
              </Link>

            </div>

            <div className="doctors-image">
              <img
                src="/image/service2.png"
                alt="Doctor using MedQueue"
              />
            </div>

          </div>

        </section>


        {/* DYNAMIC DOCTOR SPECIALTIES */}

        <section className="specialties-section">

          <div className="specialties-heading">
            <span>
              <h3 className="heading">EXPLORE SPECIALTIES</h3>
            </span>

            <h2>
              Find the Right Specialist for
              <span className="colo"> Your Health</span>
            </h2>

            <p>
              Explore qualified doctors across different medical specialties.
            </p>
          </div>

          <div className="specialties-slider-wrapper">

            {/* LEFT BUTTON */}
            <button
              type="button"
              className="specialty-arrow specialty-prev"
              onClick={() => scrollSpecialties(-1)}
              aria-label="Previous doctors"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            <div className="specialties-slider" ref={specialtiesSliderRef}>

              {specialtiesLoading ? (

                <p className="specialties-message">
                  Loading doctor specialties...
                </p>

              ) : specialtiesError ? (

                <p className="specialties-message specialties-error">
                  {specialtiesError}
                </p>

              ) : specialties.length === 0 ? (

                <p className="specialties-message">
                  No verified doctor specialties available yet.
                </p>

              ) : (

                specialties.map((doctor) => (

                  <div className="specialty-card" key={doctor._id}>

                    <div className="specialty-image">
                      <img
                        src={doctor.profileImage}
                        alt={doctor.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>

                    <div className="specialty-content">

                      {/* <div className="specialty-icon">
                <i className="fa-solid fa-user-doctor"></i>
              </div> */}

                      <div className="specialty-info">

                        <h3>{doctor.specialization}</h3>

                        <p>Dr. {doctor.name}</p>

                        <span className="specialty-qualification">
                          {doctor.qualification}
                        </span>

                        <span className="specialty-experience">
                          {doctor.experienceYears} years experience
                        </span>

                      </div>

                    </div>

                  </div>

                ))

              )}

            </div>

            {/* RIGHT BUTTON */}
            <button
              type="button"
              className="specialty-arrow specialty-next"
              onClick={() => scrollSpecialties(1)}
              aria-label="Next doctors"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>

          </div>

          <div className="specialties-note">
            Find the right healthcare professional for your needs.
          </div>

        </section>



        {/* HOW MEDQUEUE WORKS */}
        <section className="how-works-section">

          {/* HEADING */}
          <div className="how-works-heading">

            <span><h3 className="heading">HOW MEDQUEUE WORKS</h3></span>

            <h2>
              Get Care with MedQueue in 4 <span className="colo">Simple Steps</span>
            </h2>

            <p>
              Finding the right doctor and getting the care you need
              is quick, simple and convenient.
            </p>

          </div>

          {/* FOUR STEPS */}
          <div className="how-works-container">

            {/* STEP 1 */}
            <div className="how-work-card">


              <div className="how-work-image">
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=700&q=85"
                  alt="Patient searching for a doctor"
                  loading="lazy"
                />
              </div>

              <div className="how-work-icon">
                <i className="fa-solid fa-magnifying-glass"></i>
              </div>

              <div className="how-work-content">
                <h3>Find a Doctor</h3>
                <p>
                  Explore verified doctors based on specialization
                  and location.
                </p>
              </div>

            </div>

            {/* STEP 2 */}
            <div className="how-work-card">
              <div className="how-work-image">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=700&q=85"
                  alt="Booking an appointment online"
                  loading="lazy"
                />
              </div>

              <div className="how-work-icon">
                <i className="fa-solid fa-calendar-check"></i>
              </div>

              <div className="how-work-content">
                <h3>Book Appointment</h3>
                <p>
                  Choose your preferred doctor and a convenient
                  appointment time.
                </p>
              </div>

            </div>

            {/* STEP 3 */}
            <div className="how-work-card">
              <div className="how-work-image">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=700&q=85"
                  alt="Doctor consulting a patient"
                  loading="lazy"
                />
              </div>

              <div className="how-work-icon">
                <i className="fa-solid fa-video"></i>
              </div>

              <div className="how-work-content">
                <h3>Consult Your Doctor</h3>
                <p>
                  Visit the clinic or connect with your doctor
                  through online video consultation.
                </p>
              </div>

            </div>

            {/* STEP 4 */}
            <div className="how-work-card">
              <div className="how-work-image">
                <img
                  src="https://images.unsplash.com/photo-1585435557343-3b092031a831?w=700&q=85"
                  alt="Digital medical prescription"
                  loading="lazy"
                />
              </div>

              <div className="how-work-icon">
                <i className="fa-solid fa-file-prescription"></i>
              </div>

              <div className="how-work-content">
                <h3>Get Your Prescription</h3>
                <p>
                  Access your digital prescription and keep
                  track of your health records.
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* FAQ SECTION */}
        <section className="faq-section">

          <div className="faq-container">

            {/* LEFT CONTENT */}
            <div className="faq-left">

              <h2>
                Frequently

                Asked
                <br />
                <span>Questions</span>
              </h2>

              <p>
                Have questions about MedQueue? Find simple
                answers to help you understand our healthcare
                platform.
              </p>

              <div className="faq-robot">
                <img
                  src="/image/roboimage.png"
                  alt="MedQueue Healthcare Assistant"
                  loading="lazy"
                />
              </div>

            </div>

            {/* RIGHT FAQ */}
            <div className="faq-right">

              {(() => {
                const faqQuestions = [
                  {
                    question: "What is MedQueue?",
                    answer:
                      "MedQueue is an online healthcare platform that helps patients discover doctors, book appointments and access convenient healthcare services."
                  },
                  {
                    question: "How can I book an appointment on MedQueue?",
                    answer:
                      "Create your patient account, explore available doctors, choose your preferred doctor and select a suitable appointment date and time."
                  },
                  {
                    question: "Are doctors on MedQueue verified?",
                    answer:
                      "Yes. Doctors are required to submit their professional documents for verification before their profiles are approved on the platform."
                  },
                  {
                    question: "Can I consult a doctor online?",
                    answer:
                      "Yes. You can connect with doctors through online video consultation whenever the doctor provides this service."
                  },
                  {
                    question: "How can I register as a doctor?",
                    answer:
                      "Select the doctor registration option, complete your profile and upload the required professional certificates and registration documents for verification."
                  },
                  {
                    question: "Can I cancel or reschedule my appointment?",
                    answer:
                      "You can manage your appointment through your patient account. Cancellation or rescheduling depends on the appointment status and applicable platform policy."
                  },
                  {
                    question: "Can I chat with my doctor?",
                    answer:
                      "Yes. MedQueue provides a chat feature that allows patients and doctors to communicate through messages."
                  },
                  {
                    question: "Can I get a digital prescription?",
                    answer:
                      "Yes. When your doctor provides a digital prescription, you can access it through your MedQueue account."
                  },
                  {
                    question: "Is MedQueue available for patients and doctors?",
                    answer:
                      "Yes. MedQueue provides separate registration and account experiences for patients and doctors."
                  }
                ];

                return (
                  <FAQAccordion questions={faqQuestions} />
                );
              })()}

            </div>

          </div>

        </section>




      </main>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}

function FAQAccordion({ questions }) {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="faq-list">
      {questions.map((item, index) => (
        <div
          className={`faq-item ${activeIndex === index ? "active" : ""}`}
          key={index}
        >
          <button
            className="faq-question"
            onClick={() =>
              setActiveIndex(activeIndex === index ? null : index)
            }
            aria-expanded={activeIndex === index}
          >
            <span>{item.question}</span>
            <span className="faq-toggle">
              {activeIndex === index ? "−" : "+"}
            </span>
          </button>

          {activeIndex === index && (
            <div className="faq-answer">
              <p>{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
