import { Link } from "react-router-dom";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar.jsx";
import { useState } from "react";
import "./Work.css";

export default function Work() {
  return (
    <div className="work-page">

      {/* HEADER */}
      <Navbar />

      <main>

        {/* ALL HOW IT WORKS SECTIONS WILL COME HERE */}
        
{/* HOW IT WORKS HERO */}
<section className="work-hero">

  <div className="work-hero-overlay"></div>

  <div className="work-hero-content">

    <h1>
      Your Healthcare Journey,
      <br />
      Made Simple
    </h1>

    <p>
      From finding the right doctor to booking appointments
      and getting prescriptions, MedQueue makes every step
      of your healthcare journey easier.
    </p>

  </div>

  <div className="work-hero-wave"></div>

</section>

{/* CHOOSE YOUR JOURNEY */}
<section className="journey-section">

  {/* SECTION HEADING */}
  <div className="journey-heading">

    <span className="journey-label"><h3 className="heading">HOW IT WORKS</h3></span>

    <h2>
      Choose Your Journey with <span className="colo">MedQueue</span>
    </h2>

    <p>
      Personalized healthcare experiences for patients and doctors.
    </p>

  </div>

  {/* JOURNEY CARDS */}
  <div className="journey-container">

    {/* PATIENT CARD */}
    <div className="journey-card">

      <div className="journey-image patient-journey-image">
        <img
          src="/image/work.png"
          alt="Patient using MedQueue on a laptop"
          loading="lazy"
        />
      </div>

      <div className="journey-content">
        <div className="journey-icon">
          <i className="fa-solid fa-users"></i>
        </div>

        <h3>For Patients</h3>

        <p>
          Find trusted doctors, book appointments,
          consult online and manage your health journey.
        </p>

        <Link to="/signup" className="journey-button">
          Explore Patient Journey
          <i className="fa-solid fa-arrow-right"></i>
        </Link>

      </div>

    </div>

    {/* DOCTOR CARD */}
    <div className="journey-card">

      <div className="journey-image doctor-journey-image">
        <img
          src="/image/doctor.png"
          alt="Doctor managing healthcare services on a laptop"
          loading="lazy"
        />
      </div>

      <div className="journey-content">


        <div className="journey-icon">
          <i className="fa-solid fa-user-doctor"></i>
        </div>

        <h3>For Doctors</h3>

        <p>
          Create your profile, complete verification,
          manage appointments and connect with patients.
        </p>

        <Link to="/signup" className="journey-button">
          Explore Doctor Journey
          <i className="fa-solid fa-arrow-right"></i>
        </Link>

      </div>

    </div>

  </div>

</section>

{/* DOCTOR DAILY WORKFLOW */}
<section className="doctor-workflow-section">

  {/* SECTION HEADING */}
  <div className="doctor-workflow-heading">

    <span><h3 className="heading">DOCTOR WORKFLOW</h3></span>

    <h2>
      A Better Way to Manage <span className="colo">Your Practice</span>
    </h2>

    <p>
      Handle your daily clinic or hospital operations on MedQueue —
      from appointments to prescriptions, all in one place.
    </p>

  </div>

  {/* MAIN CONTENT */}
  <div className="doctor-workflow-container">

    {/* LEFT IMAGE AND DASHBOARD */}
    <div className="doctor-workflow-visual">

      {/* DASHBOARD PREVIEW */}
      <div className="workflow-dashboard">

        <div className="workflow-dashboard-header">
          <div className="workflow-dashboard-brand">
            <i className="fa-solid fa-heart-pulse"></i>
            <strong>MedQueue</strong>
          </div>
          <span className="workflow-dashboard-status">Doctor Panel</span>
        </div>

        <div className="workflow-dashboard-body">

          <p className="workflow-dashboard-greeting">
            Good Morning, Doctor!
          </p>

          <span className="workflow-dashboard-subtitle">
            Here's your clinic overview.
          </span>

          <div className="workflow-dashboard-stats">

            <div className="workflow-stat">
              <i className="fa-solid fa-calendar-check"></i>
              <span>Appointments</span>
              <strong>12</strong>
            </div>

            <div className="workflow-stat">
              <i className="fa-solid fa-user-group"></i>
              <span>Patients</span>
              <strong>320+</strong>
            </div>

          </div>

          <div className="workflow-schedule">
            <div className="workflow-schedule-heading">
              <strong>Today's Schedule</strong>
              <span>View All</span>
            </div>

            <div className="workflow-schedule-row">
              <span>10:00 AM</span>
              <i className="fa-solid fa-user"></i>
              <strong>Patient Visit</strong>
            </div>

            <div className="workflow-schedule-row">
              <span>11:30 AM</span>
              <i className="fa-solid fa-user"></i>
              <strong>Follow-up</strong>
            </div>

            <div className="workflow-schedule-row">
              <span>02:00 PM</span>
              <i className="fa-solid fa-video"></i>
              <strong>Online Consult</strong>
            </div>
          </div>

        </div>
      </div>

    </div>

    {/* RIGHT FEATURE CARDS */}
    <div className="doctor-workflow-features">

      <div className="workflow-feature-card">
        <div className="workflow-feature-icon">
          <i className="fa-solid fa-calendar-check"></i>
        </div>
        <h3>Manage Appointments</h3>
        <p>
          View upcoming bookings, manage time slots
          and organize your daily schedule.
        </p>
      </div>

      <div className="workflow-feature-card">
        <div className="workflow-feature-icon">
          <i className="fa-solid fa-comments"></i>
        </div>
        <h3>Patient Communication</h3>
        <p>
          Chat with patients, share reports and
          stay connected whenever needed.
        </p>
      </div>

      <div className="workflow-feature-card">
        <div className="workflow-feature-icon">
          <i className="fa-solid fa-video"></i>
        </div>
        <h3>Digital Consultations</h3>
        <p>
          Consult with patients through secure
          video calls from your clinic or home.
        </p>
      </div>

      <div className="workflow-feature-card">
        <div className="workflow-feature-icon">
          <i className="fa-solid fa-file-prescription"></i>
        </div>
        <h3>Patient Records & Prescriptions</h3>
        <p>
          Access patient history, manage records
          and provide digital prescriptions.
        </p>
      </div>

    </div>

  </div>

</section>

{/* HOW IT WORKS FOR PATIENTS */}
<section className="patient-journey-section">

  {/* SECTION HEADING */}
  <div className="patient-journey-heading">
    <span><h3 className="heading">FOR PATIENTS</h3></span>

    <h2>
      Your Healthcare Journey <span className="colo">Made Simple</span>
    </h2>

    <p>
      From finding the right doctor to receiving your prescription,
      manage your healthcare journey with MedQueue.
    </p>
  </div>

  {/* PATIENT STEPS */}
  <div className="patient-steps-container">

    {/* STEP 1 */}
    <div className="patient-step-card">
      <div className="patient-step-image">
        <img
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=700&q=85"
          alt="Patient creating an account"
          loading="lazy"
        />
      </div>

      <div className="patient-step-content">
        <div className="patient-step-icon">
          <i className="fa-solid fa-user-plus"></i>
        </div>
        <h3>Create Your Account</h3>
        <p>
          Sign up as a patient on MedQueue and get started
          with your healthcare journey.
        </p>
      </div>
    </div>

    {/* STEP 2 */}
    <div className="patient-step-card">
      <div className="patient-step-image">
        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=700&q=85"
          alt="Searching for doctors online"
          loading="lazy"
        />
      </div>

      <div className="patient-step-content">
        <div className="patient-step-icon">
          <i className="fa-solid fa-magnifying-glass"></i>
        </div>
        <h3>Find the Right Doctor</h3>
        <p>
          Explore and search doctors by specialization,
          location and consultation type.
        </p>
      </div>
    </div>

    {/* STEP 3 */}
    <div className="patient-step-card">
      <div className="patient-step-image">
         <img
          src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=700&q=85"
          alt="Doctor profile and consultation"
          loading="lazy"
        />
      </div>

      <div className="patient-step-content">
        <div className="patient-step-icon">
          <i className="fa-solid fa-user-doctor"></i>
        </div>
        <h3>Check Doctor Profile</h3>
        <p>
          View the doctor's qualifications, experience,
          specialization and consultation fees.
        </p>
      </div>
    </div>

    {/* STEP 4 */}
    <div className="patient-step-card">
      <div className="patient-step-image">
        <img
          src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=700&q=85"
          alt="Appointment calendar"
          loading="lazy"
        />
      </div>

      <div className="patient-step-content">
        <div className="patient-step-icon">
          <i className="fa-solid fa-calendar-check"></i>
        </div>
        <h3>Book Appointment</h3>
        <p>
          Choose your preferred date and time,
          and confirm your appointment.
        </p>
      </div>
    </div>

    {/* STEP 5 */}
    <div className="patient-step-card">
      <div className="patient-step-image">
        <img
          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=700&q=85"
          alt="Doctor consulting a patient"
          loading="lazy"
        />
      </div>

      <div className="patient-step-content">
        <div className="patient-step-icon">
          <i className="fa-solid fa-video"></i>
        </div>
        <h3>Consult Your Doctor</h3>
        <p>
          Visit the clinic in person or connect online
          through video consultation when available.
        </p>
      </div>
    </div>

    {/* STEP 6 */}
    <div className="patient-step-card">
      <div className="patient-step-image">
        <img
          src="https://images.unsplash.com/photo-1585435557343-3b092031a831?w=700&q=85"
          alt="Digital prescription and medical documents"
          loading="lazy"
        />
      </div>

      <div className="patient-step-content">
        <div className="patient-step-icon">
          <i className="fa-solid fa-file-prescription"></i>
        </div>
        <h3>Get Your Prescription</h3>
        <p>
          Receive and access your digital prescription
          whenever it is provided by your doctor.
        </p>
      </div>
    </div>

  </div>

</section>

{/* FAQ SECTION */}
<section className="work-faq-section">

  <div className="work-faq-container">

    {/* LEFT CONTENT */}
    <div className="work-faq-left">

      <span className="work-faq-label"><h3 className="heading">MEDQUEUE FAQ</h3></span>

      <h2>
        Frequently Asked 
        
        <br />
       <span>Questions</span>
      </h2>

      <p>
        Have questions about MedQueue? Find simple
        answers to help you understand our healthcare
        platform.
      </p>

      <div className="work-faq-robot">
        <img
          src="/image/roboimage.png"
          alt="MedQueue Healthcare Assistant"
          loading="lazy"
        />
      </div>

    </div>

    {/* RIGHT ACCORDION */}
    <div className="work-faq-right">
      <WorkFAQAccordion />
    </div>

  </div>

</section>



      </main>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}

function WorkFAQAccordion() {

  const [activeIndex, setActiveIndex] = useState(0);

  const questions = [
    {
      question: "What is MedQueue?",
      answer:
        "MedQueue is an online healthcare platform that connects patients with doctors. Patients can find doctors, book appointments, consult online where available and access digital prescriptions when provided."
    },
    {
      question: "How can I book an appointment on MedQueue?",
      answer:
        "Create your patient account, search for a doctor by specialization, view their profile and select an available appointment date and time."
    },
    {
      question: "Are doctors on MedQueue verified?",
      answer:
        "Doctors submit their professional qualifications and registration documents for verification. Approved doctor profiles become available to patients."
    },
    {
      question: "Can I consult a doctor online?",
      answer:
        "Yes. You can connect with a doctor through video consultation when the doctor offers online consultation."
    },
    {
      question: "How can I register as a doctor?",
      answer:
        "Choose doctor registration, complete your profile and upload the required professional certificates and registration documents for verification."
    },
    {
      question: "Can I cancel my appointment?",
      answer:
        "Appointment cancellation depends on the appointment status and the cancellation options available in your account."
    },
    {
      question: "Can I chat with my doctor?",
      answer:
        "Yes. MedQueue provides a chat feature that allows patients and doctors to communicate through messages."
    },
    {
      question: "How can I access my digital prescription?",
      answer:
        "When your doctor provides a digital prescription, you can access it through your MedQueue account."
    }
  ];

  return (
    <div className="work-faq-list">

      {questions.map((item, index) => (
        <div
          className={`work-faq-item ${
            activeIndex === index ? "active" : ""
          }`}
          key={index}
        >

          <button
            className="work-faq-question"
            onClick={() =>
              setActiveIndex(
                activeIndex === index ? null : index
              )
            }
            aria-expanded={activeIndex === index}
          >

            <span>{item.question}</span>

            <span className="work-faq-toggle">
              {activeIndex === index ? "−" : "+"}
            </span>

          </button>

          {activeIndex === index && (
            <div className="work-faq-answer">
              <p>{item.answer}</p>
            </div>
          )}

        </div>
      ))}

    </div>
  );
}