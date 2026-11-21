
import { Link } from "react-router-dom";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar.jsx";
import "./Terms.css";

const termsSections = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: [
      "Welcome to MedQueue. MedQueue is a digital healthcare platform designed to connect patients with healthcare professionals.",
      "Our platform provides features such as doctor discovery, appointment booking, patient and doctor accounts, online chat, video consultations and digital prescriptions where available.",
      "MedQueue primarily facilitates communication and appointment management between patients and doctors. It does not replace a hospital, clinic or qualified medical professional."
    ]
  },
  {
    id: "acceptance",
    title: "2. Acceptance of Terms",
    content: [
      "By accessing or using MedQueue, you agree to these Terms & Conditions and our applicable policies.",
      "If you do not agree with any part of these terms, you should stop using the platform.",
      "These terms apply to all users, including patients, doctors and other authorized users."
    ]
  },
  {
    id: "eligibility",
    title: "3. Eligibility",
    content: [
      "You must be legally capable of entering into an agreement under applicable law to create and use an account.",
      "Patients below the age of 18 should use the platform with the involvement and consent of a parent or legal guardian.",
      "Doctors must hold valid qualifications and registration required to provide the medical services they offer."
    ]
  },
  {
    id: "account",
    title: "4. Account Registration and Security",
    content: [
      "Users must provide accurate, complete and up-to-date information during registration.",
      "You are responsible for maintaining the confidentiality of your login credentials and for activities performed through your account.",
      "You must not share your account with unauthorized persons or create accounts using false identities.",
      "Notify MedQueue promptly if you suspect unauthorized access to your account."
    ]
  },
  {
    id: "patient",
    title: "5. Patient Responsibilities",
    content: [
      "Patients must provide accurate personal and relevant health information when using MedQueue.",
      "Patients should review doctor profiles, qualifications, specialization and available appointment details before booking.",
      "Patients must attend appointments on time and communicate respectfully with doctors.",
      "Patients should not misuse chat, video consultation, appointment or prescription features.",
      "Patients are responsible for following medical instructions provided by their treating healthcare professional."
    ]
  },
  {
    id: "doctor",
    title: "6. Doctor Responsibilities",
    content: [
      "Doctors must provide genuine, accurate and up-to-date professional information.",
      "Doctors must upload valid qualification certificates and medical registration documents when requested.",
      "Doctors are responsible for maintaining valid professional registration and complying with applicable medical laws and professional standards.",
      "Doctors must provide consultations within their qualifications and area of expertise.",
      "Doctors must maintain patient confidentiality and handle patient information responsibly.",
      "Doctors must not use MedQueue to misrepresent qualifications, offer unauthorized services or engage in misleading activities."
    ]
  },
  {
    id: "verification",
    title: "7. Doctor Verification and Approval",
    content: [
      "Doctor accounts may require administrative review before their profiles become visible or available for patient bookings.",
      "MedQueue may review submitted identity, qualification and medical registration documents.",
      "Submitting documents does not guarantee approval.",
      "MedQueue may approve, reject, suspend or request additional information regarding a doctor profile.",
      "Approval on MedQueue should not be interpreted as a guarantee of treatment quality or medical outcomes.",
      "Doctors must update their documents if their professional registration or qualifications change."
    ]
  },
  {
    id: "appointments",
    title: "8. Appointment Booking and Cancellation",
    content: [
      "Patients can browse available doctors and request appointments through the platform.",
      "Appointment confirmation depends on doctor availability and the booking status displayed on MedQueue.",
      "Patients should check appointment date, time, consultation type and applicable fees before confirming a booking.",
      "Any cancellation, rescheduling, missed appointment or refund request will be subject to the applicable appointment and refund policy.",
      "Doctors should make reasonable efforts to attend confirmed appointments or inform patients about changes.",
      "MedQueue does not guarantee that every requested appointment will be accepted or completed."
    ]
  },
  {
    id: "consultation",
    title: "9. Chat and Video Consultation",
    content: [
      "MedQueue may provide chat and video consultation facilities to help patients communicate with doctors.",
      "These facilities depend on technical availability, internet connectivity and the services offered by the doctor.",
      "Users must not share abusive, illegal, misleading or inappropriate content through these features.",
      "Users should not record, distribute or publish consultation communications without the required consent and legal authorization.",
      "Online consultation may not be appropriate for every medical condition. Doctors may recommend an in-person examination when necessary."
    ]
  },
  {
    id: "medical",
    title: "10. Medical Disclaimer and Emergencies",
    content: [
      "MedQueue is a technology platform and is not itself a hospital, clinic, emergency service or medical practitioner.",
      "Medical diagnosis, treatment decisions and prescriptions are the responsibility of the treating doctor.",
      "MedQueue does not guarantee any particular treatment result, recovery or medical outcome.",
      "Patients should independently seek clarification from their doctor about diagnosis, medication and treatment.",
      "In case of a medical emergency, do not rely on MedQueue. Contact emergency services or visit the nearest hospital immediately."
    ]
  },
  {
    id: "prescription",
    title: "11. Digital Prescriptions",
    content: [
      "Doctors may provide digital prescriptions through MedQueue when the feature is available and appropriate.",
      "Prescriptions must be issued by the treating doctor in accordance with applicable laws and professional requirements.",
      "Patients should follow prescription instructions and contact their doctor if they have questions.",
      "Patients must not alter, forge, misuse or distribute prescriptions for unlawful purposes.",
      "MedQueue is not responsible for unauthorized changes made to prescriptions outside the platform."
    ]
  },
  {
    id: "payment",
    title: "12. Payments and Fees",
    content: [
      "Consultation fees, if applicable, may be determined by the respective doctor or displayed during the booking process.",
      "Any platform subscription, service charge or other fee will be communicated to the relevant user before it becomes payable.",
      "Users should verify the payable amount and payment instructions before completing a transaction.",
      "Refunds, cancellations and payment disputes will be handled according to the applicable refund policy and relevant payment terms.",
      "Users must not submit false payment confirmations or misuse any payment-related feature.",
      "MedQueue will not ask users to disclose their banking passwords, OTPs or confidential payment credentials."
    ]
  },
  {
    id: "privacy",
    title: "13. Privacy and Data Protection",
    content: [
      "MedQueue may collect personal, account, appointment and other information necessary to provide its services.",
      "Users should provide only accurate information and avoid sharing unnecessary sensitive information.",
      "Doctors must handle patient information confidentially and only use it for legitimate and authorized purposes.",
      "MedQueue will handle personal information in accordance with its Privacy Policy and applicable data protection laws.",
      "Users should review the Privacy Policy to understand how their information is collected, used, stored and protected."
    ]
  },
  {
    id: "prohibited",
    title: "14. Prohibited Activities",
    content: [
      "Users must not:",
      "Create fake accounts or provide false medical, personal or professional information.",
      "Upload forged certificates, prescriptions or other misleading documents.",
      "Attempt unauthorized access to another user's account or platform systems.",
      "Use the platform for harassment, fraud, spam or illegal activities.",
      "Copy, distribute, damage or interfere with MedQueue's software, content or services without authorization.",
      "Misuse patient information or violate another person's privacy."
    ]
  },
  {
    id: "suspension",
    title: "15. Account Suspension and Termination",
    content: [
      "MedQueue may restrict, suspend or terminate an account if a user violates these terms or applicable laws.",
      "Accounts may also be restricted where fraudulent activity, false documentation, security risks or misuse is suspected.",
      "Where appropriate and legally permitted, users may be informed about the reason for the restriction.",
      "Users may contact MedQueue support to raise concerns regarding an account restriction.",
      "Termination does not remove obligations or liabilities that arose before termination."
    ]
  },
  {
    id: "liability",
    title: "16. Limitation of Liability",
    content: [
      "MedQueue aims to provide a reliable platform but does not guarantee uninterrupted, error-free or continuously available services.",
      "MedQueue is not responsible for independent medical decisions, professional conduct or treatment outcomes of doctors, subject to applicable law.",
      "Users are responsible for the accuracy of the information they submit and for their use of the platform.",
      "Nothing in these terms excludes or limits any liability that cannot legally be excluded or limited under applicable law."
    ]
  },
  {
    id: "third-party",
    title: "17. Third-Party Services",
    content: [
      "Some platform features may depend on third-party services such as hosting providers, communication tools or payment providers.",
      "Third-party services may have their own terms, privacy policies and availability conditions.",
      "MedQueue is not responsible for independent changes or interruptions caused by third-party providers, subject to applicable law."
    ]
  },
  {
    id: "changes",
    title: "18. Changes to These Terms",
    content: [
      "MedQueue may update these Terms & Conditions when required due to changes in services, business practices or applicable laws.",
      "Updated terms will be published on this page with a revised Last Updated date.",
      "Continued use of the platform after updated terms become effective will be subject to the revised terms, as permitted by law."
    ]
  },
  {
    id: "law",
    title: "19. Governing Law and Jurisdiction",
    content: [
      "These Terms & Conditions will be governed by the laws of India.",
      "Any dispute arising from the use of MedQueue will be subject to the jurisdiction of the competent courts in accordance with applicable law."
    ]
  },
  {
    id: "contact",
    title: "20. Contact Us",
    content: [
      "If you have questions, concerns or requests regarding these Terms & Conditions, you can contact the MedQueue team.",
      "Email: support@medqueue.com",
      "Please include a clear description of your concern so that the team can review your request."
    ]
  }
];

export default function Terms() {
  return (
    <div className="terms-page">

      {/* Existing MedQueue Header */}
      <Navbar />

      <main className="terms-main">

        <section className="terms-hero">
          <h1>Terms & <span>Conditions</span></h1>
          <p>
            Please read these terms carefully to understand the rules,
            responsibilities and conditions of using MedQueue.
          </p>
          <div className="terms-updated">
            <span className="terms-update-dot"></span>
            Last Updated: November 14, 2026
          </div>
        </section>

        <section className="terms-layout">

          <aside className="terms-sidebar">
            <div className="terms-sidebar-inner">
              <span className="terms-sidebar-label">ON THIS PAGE</span>
              <h3>Quick Navigation</h3>

              <nav>
                {termsSections.map((section) => (
                  <a key={section.id} href={`#${section.id}`}>
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="terms-content">

            {/* <div className="terms-intro-card">
              <div className="terms-intro-icon">✓</div>
              <div>
                <h2>Welcome to MedQueue</h2>
                <p>
                  These terms explain how patients and doctors can use
                  MedQueue responsibly. Please review all sections before
                  using our platform.
                </p>
              </div>
            </div> */}

            {termsSections.map((section) => (
              <section
                className="terms-section"
                id={section.id}
                key={section.id}
              >
                <h2>{section.title}</h2>

                {section.id === "prohibited" ? (
                  <>
                    <p>{section.content[0]}</p>
                    <ul>
                      {section.content.slice(1).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  section.content.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                )}
              </section>
            ))}

            <div className="terms-bottom-note">
              <h3>Thank you for choosing MedQueue.</h3>
              <p>
                We appreciate your trust. By using MedQueue responsibly,
                you help us build a better healthcare experience for everyone.
              </p>
              <Link to="/" className="terms-home-link">
                Back to Home <span>→</span>
              </Link>
            </div>

          </div>
        </section>
      </main>

      {/* Existing MedQueue Footer */}
      <Footer />

    </div>
  );
}