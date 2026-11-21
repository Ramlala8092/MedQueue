
import { Link } from "react-router-dom";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar.jsx";
import "./Privacy.css";

const privacySections = [
  {
    id: "introduction",
    title: "1. Introduction",
    paragraphs: [
      "Welcome to MedQueue. Your privacy and the security of your personal information are important to us.",
      "MedQueue is a digital healthcare platform that connects patients with doctors and provides services such as doctor discovery, appointment booking, online consultations, chat communication and digital prescriptions where available.",
      "This Privacy Policy explains what information we collect, why we collect it, how we use and protect it, when it may be shared and what choices and rights are available to you.",
      "By accessing or using MedQueue, you acknowledge that you have read this Privacy Policy. Where consent is required, we will seek it separately and clearly."
    ]
  },
  {
    id: "information",
    title: "2. Information We Collect",
    paragraphs: [
      "We collect only the information reasonably necessary to operate, maintain and improve our platform and provide the requested services.",
      "Depending on how you use MedQueue, information may include:"
    ],
    bullets: [
      "Account information such as name, email address, phone number and account role.",
      "Login and authentication information, including securely stored password hashes.",
      "Profile information and details submitted during registration.",
      "Appointment information, including doctor, appointment date, time, consultation preference and booking status.",
      "Information voluntarily shared during communication with doctors.",
      "Technical information such as browser type, device information, IP address and usage logs, where collected by our systems or service providers."
    ]
  },
  {
    id: "personal",
    title: "3. Personal Information",
    paragraphs: [
      "When you register as a patient or doctor, MedQueue may collect your name, email address, mobile number and other information required to create and manage your account.",
      "We use this information to identify users, manage accounts, communicate important updates, support appointment services and maintain platform security.",
      "You are responsible for providing accurate information and updating it when necessary."
    ]
  },
  {
    id: "medical",
    title: "4. Medical and Health Information",
    paragraphs: [
      "Patients may voluntarily share health-related information with doctors through appointment requests, chat messages, shared images or other available platform features.",
      "This may include symptoms, consultation reasons, medical reports, prescriptions and other health-related details.",
      "Such information may be used to facilitate communication and healthcare services requested by the patient.",
      "Please share sensitive medical information only when necessary and with the intended healthcare professional.",
      "MedQueue does not use patient medical information for unrelated purposes without an appropriate legal basis or required consent."
    ]
  },
  {
    id: "doctor",
    title: "5. Doctor Professional Information",
    paragraphs: [
      "Doctors registering on MedQueue may be required to submit professional information for profile creation and verification.",
      "This information may include:"
    ],
    bullets: [
      "Doctor's full name and contact information.",
      "Medical specialization and professional qualification.",
      "Years of professional experience.",
      "Consultation fees and clinic or professional address.",
      "Profile photograph.",
      "Degree and qualification certificates.",
      "Medical registration number.",
      "Medical registration certificate.",
      "Verification status and administrative review information."
    ],
    extra: [
      "Documents submitted for verification may be accessed by authorized MedQueue administrators for verification and platform safety purposes.",
      "Some approved professional profile information may be displayed publicly so patients can review doctors before requesting appointments."
    ]
  },
  {
    id: "appointments",
    title: "6. Appointment Information",
    paragraphs: [
      "When a patient requests an appointment, MedQueue may process information such as the selected doctor, appointment date, appointment time, consultation preference, appointment duration, reason for consultation and booking status.",
      "This information is used to create, manage, confirm, update or cancel appointments and to support communication between patients and doctors.",
      "Appointment information may be accessible to the patient, the relevant doctor and authorized administrators where necessary for platform operations."
    ]
  },
  {
    id: "chat",
    title: "7. Chat, Images and Communication",
    paragraphs: [
      "MedQueue provides chat facilities that may allow patients and doctors to exchange text messages and images associated with an appointment.",
      "Chat information may include message content, shared image files, sender information, timestamps and message read status.",
      "These communications may contain personal or health-related information. Users should take care when sharing sensitive information.",
      "Messages and shared files may be retained as necessary for providing the service, maintaining records, resolving disputes and complying with applicable laws.",
      "Users must not access, copy or distribute another person's private conversations without proper authorization."
    ]
  },
  {
    id: "video",
    title: "8. Video Consultation",
    paragraphs: [
      "MedQueue may provide video consultation features to help patients communicate with doctors remotely.",
      "Video calls may involve real-time audio, video and technical connection information.",
      "We do not claim that video calls are recorded or stored unless a specific recording feature is introduced and users are clearly informed about it.",
      "Users should not record or distribute consultations without the required consent and legal authorization.",
      "Video consultation availability may depend on internet connectivity and third-party communication technology."
    ]
  },
  {
    id: "usage",
    title: "9. How We Use Your Information",
    paragraphs: [
      "MedQueue may use collected information for the following purposes:"
    ],
    bullets: [
      "Creating and managing patient and doctor accounts.",
      "Authenticating users and maintaining account security.",
      "Creating and managing appointment requests.",
      "Connecting patients with selected doctors.",
      "Supporting chat and video consultation features.",
      "Enabling doctor document verification and administrative review.",
      "Supporting digital prescription services where available.",
      "Responding to support requests and user complaints.",
      "Detecting fraud, misuse and unauthorized access.",
      "Maintaining, troubleshooting and improving platform functionality.",
      "Meeting applicable legal and regulatory obligations."
    ]
  },
  {
    id: "consent",
    title: "10. Legal Basis and User Consent",
    paragraphs: [
      "MedQueue will process personal information on an appropriate legal basis under applicable law, including consent where required.",
      "Where consent is required, we will explain what information is being collected and the specific purposes for which it will be used.",
      "You may withdraw consent through the available account or communication channels. Withdrawal will not affect processing already lawfully carried out before withdrawal.",
      "Some services may not be available if information necessary for providing those services is not provided.",
      "We may also process information where permitted or required by applicable law."
    ]
  },
  {
    id: "sharing",
    title: "11. How We Share Information",
    paragraphs: [
      "MedQueue does not sell your personal information as part of its ordinary platform operations.",
      "We may share information only where reasonably necessary and subject to applicable law, including with:"
    ],
    bullets: [
      "The doctor selected by a patient, to facilitate the requested appointment or consultation.",
      "Patients, where relevant, with the doctor who is managing their appointment.",
      "Authorized MedQueue administrators for account management, doctor verification and support.",
      "Technology, hosting, communication and infrastructure providers who help operate the platform.",
      "Payment service providers, if payment processing is introduced or enabled.",
      "Government authorities, regulators or law enforcement agencies when legally required.",
      "Other parties where the user has provided appropriate consent or the disclosure is otherwise legally permitted."
    ],
    extra: [
      "We expect service providers handling personal information on our behalf to use it only for authorized service-related purposes and apply appropriate safeguards."
    ]
  },
  {
    id: "security",
    title: "12. Data Storage and Security",
    paragraphs: [
      "MedQueue takes reasonable technical and organizational measures designed to protect personal information against unauthorized access, misuse, alteration, disclosure and loss.",
      "Our application may use authentication controls, access restrictions and secure password hashing to protect accounts.",
      "Access to private information and doctor verification documents should be restricted to authorized persons who need it for legitimate platform operations.",
      "However, no internet-based service or electronic storage system can be guaranteed to be completely secure.",
      "Users should keep their login credentials confidential and immediately report suspected unauthorized access."
    ]
  },
  {
    id: "retention",
    title: "13. Data Retention and Deletion",
    paragraphs: [
      "MedQueue retains personal information only for as long as reasonably necessary for the purposes for which it was collected, unless a longer period is required or permitted by applicable law.",
      "Retention periods may depend on the type of information, the user's account status, appointment records, legal requirements and the need to resolve disputes.",
      "When information is no longer required, we will take appropriate steps to delete or securely dispose of it, subject to applicable legal and operational requirements.",
      "You may request deletion of your account or personal information through the available support channels. Certain records may need to be retained where legally required."
    ]
  },
  {
    id: "cookies",
    title: "14. Cookies and Tracking Technologies",
    paragraphs: [
      "MedQueue may use cookies, local storage or similar technologies where required for platform functionality, user sessions, preferences, security and performance.",
      "The technologies actually used will depend on the features and third-party tools enabled on the website.",
      "You can manage cookies through your browser settings. Disabling certain technologies may affect some platform features.",
      "If analytics or advertising technologies are introduced, their purposes and applicable consent choices will be disclosed as required by law."
    ]
  },
  {
    id: "rights",
    title: "15. Your Privacy Rights",
    paragraphs: [
      "Subject to applicable law, users may have rights relating to their personal information, including:"
    ],
    bullets: [
      "The right to request information about personal data being processed.",
      "The right to request correction of inaccurate or incomplete information.",
      "The right to request updating of personal information.",
      "The right to request erasure of personal information where legally applicable.",
      "The right to withdraw consent where processing is based on consent.",
      "The right to raise a privacy-related grievance.",
      "The right to nominate another individual to exercise applicable rights in the event of death or incapacity, where provided by law."
    ],
    extra: [
      "To exercise these rights, contact us using the details in the Contact Us section. We may request reasonable information to verify your identity before processing a request.",
      "We will respond within the timelines prescribed by applicable law."
    ]
  },
  {
    id: "children",
    title: "16. Children's Privacy",
    paragraphs: [
      "MedQueue is not intended to encourage children to independently create accounts or use healthcare services without appropriate adult involvement.",
      "Where a person below 18 years uses the platform, a parent or lawful guardian should be involved and provide any consent required under applicable law.",
      "We will handle children's personal information in accordance with applicable legal requirements.",
      "If you believe that a child's information has been provided or processed improperly, please contact us."
    ]
  },
  {
    id: "third-party",
    title: "17. Third-Party Services",
    paragraphs: [
      "MedQueue may rely on third-party services for hosting, database infrastructure, communication, video consultation, payment processing or other technical functions.",
      "These providers may process certain information to deliver their services.",
      "Third-party websites and services may have separate privacy policies and terms. We encourage users to review those policies before using external services.",
      "MedQueue is not responsible for the independent privacy practices of external services, subject to applicable law."
    ]
  },
  {
    id: "breach",
    title: "18. Data Breach and Security Incidents",
    paragraphs: [
      "If a personal data breach occurs, MedQueue will take appropriate steps to investigate, contain and address the incident.",
      "Where notification is required, affected users and relevant authorities will be informed in accordance with applicable laws and prescribed timelines.",
      "Users should report suspected account compromise, unauthorized disclosure or other security concerns promptly."
    ]
  },
  {
    id: "transfers",
    title: "19. International Data Transfers",
    paragraphs: [
      "Depending on the infrastructure and third-party providers used by MedQueue, personal information may be processed or stored in locations outside your state or country.",
      "Any cross-border processing or transfer will be subject to applicable Indian data protection laws and restrictions imposed by the relevant authorities.",
      "We will take appropriate steps to ensure that information is handled in accordance with applicable legal requirements."
    ]
  },
  {
    id: "changes",
    title: "20. Changes to This Privacy Policy",
    paragraphs: [
      "MedQueue may update this Privacy Policy from time to time to reflect changes in platform features, data practices, technology or applicable laws.",
      "The updated version will be published on this page with a revised Last Updated date.",
      "Where required by law, we will provide notice or seek fresh consent before implementing material changes."
    ]
  },
  {
    id: "grievance",
    title: "21. Grievance Redressal",
    paragraphs: [
      "If you have a complaint or concern regarding the collection, use, disclosure or protection of your personal information, you may contact our privacy support team.",
      "We will review and respond to privacy-related complaints in accordance with applicable legal requirements.",
      "The details of the designated Grievance Officer or privacy contact should be published below before the platform is launched."
    ]
  },
  {
    id: "contact",
    title: "22. Contact Us",
    paragraphs: [
      "For questions, privacy requests, data correction or deletion requests, or concerns about this Privacy Policy, please contact MedQueue.",
      "Email: support@medqueue.com",
      "Website: MedQueue",
      "Please include your registered email address and a clear description of your request. Do not send passwords, OTPs or unnecessary medical documents by email."
    ]
  }
];

export default function PrivacyPolicy() {
  return (
    <div className="privacy-page">

      {/* SAME HEADER AS HOW IT WORKS PAGE */}
      <Navbar />

      <main className="privacy-main">

        <section className="privacy-hero">
          <div className="privacy-hero-content">
            <span className="privacy-eyebrow">
              MEDQUEUE / YOUR PRIVACY MATTERS
            </span>

            <h1>
              Privacy <span>Policy</span>
            </h1>

            <p>
              Your health information deserves care and protection.
              Learn how MedQueue collects, uses and protects your
              personal information.
            </p>

            <div className="privacy-updated">
              <span></span>
              Last Updated: November 14, 2026
            </div>
          </div>
        </section>

        <section className="privacy-layout">

          <aside className="privacy-sidebar">
            <div className="privacy-sidebar-inner">
              <span className="privacy-sidebar-label">
                PRIVACY GUIDE
              </span>

              <h3>Quick Navigation</h3>

              <nav>
                {privacySections.map((section) => (
                  <a
                    href={`#${section.id}`}
                    key={section.id}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="privacy-content">

            <div className="privacy-welcome-card">
              <div className="privacy-welcome-icon">✓</div>

              <div>
                <h2>Your Privacy Is Important</h2>
                <p>
                  We understand that healthcare information is personal.
                  This policy explains how we handle your information
                  when you use MedQueue as a patient or doctor.
                </p>
              </div>
            </div>

            {privacySections.map((section) => (
              <section
                className="privacy-section"
                id={section.id}
                key={section.id}
              >
                <h2>{section.title}</h2>

                {section.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}

                {section.bullets && (
                  <ul>
                    {section.bullets.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}

                {section.extra?.map((paragraph, index) => (
                  <p key={`extra-${index}`}>{paragraph}</p>
                ))}
              </section>
            ))}

            <div className="privacy-bottom-card">
              <div className="privacy-bottom-icon">♡</div>

              <h3>Your Trust Matters to Us</h3>

              <p>
                Thank you for choosing MedQueue. We are committed
                to treating your personal information with care
                and responsibility.
              </p>

              <Link to="/" className="privacy-home-link">
                Back to Home <span>→</span>
              </Link>
            </div>

          </div>
        </section>
      </main>

      {/* SAME FOOTER COMPONENT */}
      <Footer />

    </div>
  );
}