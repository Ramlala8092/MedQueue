
import { Link } from "react-router-dom";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar.jsx";
import { useEffect, useRef } from "react";
import "./About.css";

export default function About() {

  const missionImageRef = useRef(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show-image");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.25 }
  );

  if (missionImageRef.current) {
    observer.observe(missionImageRef.current);
  }

  return () => observer.disconnect();
}, []);


useEffect(() => {
  const cards = document.querySelectorAll(".why-card");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show-card");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  cards.forEach((card) => observer.observe(card));

  return () => observer.disconnect();
}, []);

  return (
    <div className="about-page">

      {/* Existing MedQueue Header */}
      <Navbar />

      {/* About Hero Section */}
      <main>
        <section className="about-hero">
          <div className="about-hero-overlay"></div>

          <div className="about-hero-content">
            

            <h1>
              Reimagining healthcare
              <br />
              for everyone
            </h1>

            <p>
              Connecting patients with trusted doctors
              through smarter, simpler and more accessible
              healthcare.
            </p>

            {/* <div className="about-hero-line"></div> */}
          </div>

          <div className="about-hero-curve"></div>
        </section>

        {/* Who We Are */}
        <section className="about-intro">
          <span className="heading">WHO WE ARE</span>

          <h2>
            Healthcare made
            <span> simpler for everyone.</span>
          </h2>

          <p>
            MedQueue is a digital healthcare platform designed
            to connect patients with doctors. We make it easier
            to discover healthcare professionals, book appointments,
            communicate with doctors and manage consultations
            from one convenient place.
          </p>
        </section>

        
{/* OUR MISSION SECTION */}
<section className="mission-section">

  <div className="mission-heading">
    <h2 className="heading"> Our Mission</h2>
    
  </div>

  <div className="mission-container">

    {/* LEFT CONTENT */}
    <div className="mission-content">

      <div className="mission-icon">🏥</div>

      <h3>
        Making quality healthcare
       <span className="colo"> easier to access</span>
      </h3>

      <div className="mission-points">

        <div className="mission-point">
          <span className="vision-arrow">→</span>
          <p>
            We help patients discover doctors and book
            appointments with confidence.
          </p>
        </div>

        <div className="mission-point">
          <span className="vision-arrow">→</span>
          <p>
            We make it easier to connect with healthcare
            professionals through <strong>chat and online consultations.</strong>
          </p>
        </div>

        <div className="mission-point">
          <span className="vision-arrow">→</span>
          <p>
            We support a smoother care journey with
            <strong> appointment management and digital prescriptions.</strong>
          </p>
        </div>

      </div>

     

    </div>

    {/* RIGHT IMAGE */}
    <div className="mission-image reveal-image" ref={missionImageRef}>
  <img
    src="/image/about1.jpg"
    alt="Our Mission"
  />
</div>

  </div>
</section>

{/* OUR VISION SECTION */}
<section className="vision-section">
  <div className="vision-container">

    <div className="vision-content">
      <span className="vision-label">
         <h3 className="heading">Our Vision</h3>
      </span>

      <h2>
        A healthier tomorrow
        <br />
        <span className="eeee">through connected care</span>
      </h2>

      <div className="vision-points">
        <div className="vision-point">
          <span className="vision-arrow">→</span>
          <p>
            We envision a future where <strong>quality healthcare is simple,
            accessible and available to everyone.</strong>
          </p>
        </div>

        <div className="vision-point">
          <span className="vision-arrow">→</span>
          <p>
            We aim to <strong>bring patients and doctors closer</strong> through
            technology—making consultations, bookings and follow-ups easier
            and more efficient.
          </p>
        </div>

        <div className="vision-point">
          <span className="vision-arrow">→</span>
          <p>
            We are building a <strong>digital healthcare ecosystem</strong> that
            empowers people to take better care of their health, anytime,
            anywhere.
          </p>
        </div>
      </div>
    </div>

    <div className="vision-image">
      <img
        src="/image/about2.jpg"
        alt="MedQueue vision for connected healthcare"
      />
    </div>

  </div>
</section>

{/* WHY CHOOSE MEDQUEUE SECTION */}
<section className="why-choose-section">
  <div className="why-choose-container">

    <div className="why-heading">
      <span className="why-label">
        
        <h3 className="heading">Why Choose MedQueue</h3>
      </span>

      <h2>
        A smarter, safer and more  <br /> convenient
         <span className="eeee"> healthcare experience</span>
      </h2>

      <p>
        MedQueue brings patients and doctors together on one trusted platform,
        with the right tools, verified professionals and a focus on better care.
      </p>
    </div>

    <div className="why-cards">

      <div className="why-card">
        <div className="why-icon blue">✓</div>
        <h3>Verified Doctors</h3>
        <p>Consult with qualified and verified healthcare professionals.</p>
      </div>

      <div className="why-card">
        <div className="why-icon red">▦</div>
        <h3>Easy Booking</h3>
        <p>Find doctors and book appointments in just a few clicks.</p>
      </div>

      <div className="why-card">
        <div className="why-icon purple">▶</div>
        <h3>Online Consultation</h3>
        <p>Get expert medical advice from the comfort of your home.</p>
      </div>

      <div className="why-card">
        <div className="why-icon green">℞</div>
        <h3>Digital Prescription</h3>
        <p>Receive and manage your prescriptions online safely.</p>
      </div>

      <div className="why-card">
        <div className="why-icon orange">◷</div>
        <h3>Save Time</h3>
        <p>Skip long queues and get timely medical care.</p>
      </div>

      <div className="why-card">
        <div className="why-icon blue">♙</div>
        <h3>Secure & Private</h3>
        <p>Your health data is protected with industry-level security.</p>
      </div>

    </div>
  </div>
</section>


{/* FAQ SECTION */}
<section className="faq-section">
  <div className="faq-container">

    {/* LEFT SIDE IMAGE */}
    <div className="faq-left">
      <span className="faq-tag">
          <h3 className="heading">MEDQUEUE FAQ</h3>
      </span>

      <h2>
        Frequently Asked
        <span> Questions</span>
      </h2>

      <p>
        Have questions about MedQueue? Find simple answers
        to help you understand our healthcare platform.
      </p>

      <div className="faq-image">
        <img
          src="/image/roboimage.png"
          alt="MedQueue healthcare assistant"
        />
      </div>
    </div>

    {/* RIGHT SIDE QUESTIONS */}
    <div className="faq-right">

      <details className="faq-item" open>
        <summary>
          <span>What is MedQueue?</span>
          <span className="faq-plus"></span>
        </summary>
        <div className="faq-answer">
          MedQueue is an online healthcare platform that connects
          patients with doctors. Patients can find doctors, book
          appointments, consult online where available and access
          digital prescriptions when provided.
        </div>
      </details>

      <details className="faq-item">
        <summary>
          <span>How can I book an appointment on MedQueue?</span>
          <span className="faq-plus"></span>
        </summary>
        <div className="faq-answer">
          Create a patient account, explore available doctors,
          select your preferred doctor and available appointment
          slot, then submit your booking request.
        </div>
      </details>

      <details className="faq-item">
        <summary>
          <span>Are doctors on MedQueue verified?</span>
          <span className="faq-plus"></span>
        </summary>
        <div className="faq-answer">
          Doctors are required to submit their medical qualifications
          and registration documents. Our admin team reviews the
          submitted documents before approving doctor profiles.
        </div>
      </details>

      <details className="faq-item">
        <summary>
          <span>Can I consult a doctor online?</span>
          <span className="faq-plus"></span>
        </summary>
        <div className="faq-answer">
          Yes, online consultation is available where supported.
          Patients can connect with doctors through available
          chat or video consultation features.
        </div>
      </details>

      <details className="faq-item">
        <summary>
          <span>How can I register as a doctor?</span>
          <span className="faq-plus"></span>
        </summary>
        <div className="faq-answer">
          Select the doctor registration option, fill in your
          professional details and upload the required medical
          certificates. Your profile will be reviewed by the
          admin team before approval.
        </div>
      </details>

      <details className="faq-item">
        <summary>
          <span>Can I cancel my appointment?</span>
          <span className="faq-plus"></span>
        </summary>
        <div className="faq-answer">
          Appointment cancellation depends on the booking options
          and applicable cancellation policy. Check your appointment
          details or contact support for assistance.
        </div>
      </details>

      <details className="faq-item">
        <summary>
          <span>Can I chat with my doctor?</span>
          <span className="faq-plus"></span>
        </summary>
        <div className="faq-answer">
          Yes, patients can use the available chat feature to
          communicate with their doctor and share relevant
          information during their care journey.
        </div>
      </details>

      <details className="faq-item">
        <summary>
          <span>Is MedQueue free to use?</span>
          <span className="faq-plus"></span>
        </summary>
        <div className="faq-answer">
          Any applicable consultation or service charges depend
          on the doctor and selected service. Please check the
          displayed fees before confirming your appointment.
        </div>
      </details>

    </div>
  </div>
</section>
      </main>

      {/* Existing MedQueue Footer */}
      <Footer />

    </div>
  );
}

