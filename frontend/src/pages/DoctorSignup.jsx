


// import { useState } from "react";

// export default function DoctorSignup() {
//   const [imagePreview, setImagePreview] = useState("");
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleImageChange = (event) => {
//     const file = event.target.files[0];

//     if (!file) {
//       setImagePreview("");
//       return;
//     }

//     if (!file.type.startsWith("image/")) {
//       alert("Please select a valid image.");
//       event.target.value = "";
//       return;
//     }

//     if (file.size > 2 * 1024 * 1024) {
//       alert("Profile image must be less than 2 MB.");
//       event.target.value = "";
//       return;
//     }

//     setImagePreview(URL.createObjectURL(file));
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setMessage("");

//     const form = event.currentTarget;
//     const formData = new FormData(form);

//     setLoading(true);

//     try {
//       const response = await fetch(
//         "/api/auth/register/doctor",
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           result.message || "Registration failed."
//         );
//       }

//       setMessage(
//         "Registration submitted! Your account is awaiting admin verification."
//       );

//       form.reset();
//       setImagePreview("");
//     } catch (error) {
//       setMessage(
//         error.message || "Unable to connect to the server."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="form-page">
//       <p className="eyebrow">DOCTOR REGISTRATION</p>
//       <h1>Create your doctor account</h1>

//       <form
//         className="signup-form"
//         onSubmit={handleSubmit}
//       >
//         <label>
//           Profile Image
//           <input
//             type="file"
//             name="profileImage"
//             accept="image/*"
//             onChange={handleImageChange}
//             required
//           />
//         </label>

//         {imagePreview && (
//           <img
//             src={imagePreview}
//             alt="Doctor profile preview"
//             width="120"
//             height="120"
//             style={{
//               objectFit: "cover",
//               borderRadius: "50%",
//               marginBottom: "16px",
//             }}
//           />
//         )}

//         <label>
//           Full name
//           <input
//             type="text"
//             name="name"
//             placeholder="Dr. Your Name"
//             required
//           />
//         </label>

//         <label>
//           Email
//           <input
//             type="email"
//             name="email"
//             placeholder="doctor@example.com"
//             required
//           />
//         </label>

//         <label>
//           Password
//           <input
//             type="password"
//             name="password"
//             minLength={8}
//             required
//           />
//         </label>

//         <label>
//           Specialization
//           <input
//             type="text"
//             name="specialization"
//             placeholder="e.g. Cardiologist"
//             required
//           />
//         </label>

//         <label>
//           Qualification
//           <input
//             type="text"
//             name="qualification"
//             placeholder="e.g. MBBS, MD"
//             required
//           />
//         </label>

//         <label>
//           Degree Certificate
//           <input
//             type="file"
//             name="degreeCertificate"
//             accept="image/*,.pdf"
//             required
//           />
//         </label>

//         <label>
//           Medical Registration Number
//           <input
//             type="text"
//             name="medicalRegistrationNumber"
//             placeholder="Enter registration number"
//             required
//           />
//         </label>

//         <label>
//           Medical Registration Certificate
//           <input
//             type="file"
//             name="registrationCertificate"
//             accept="image/*,.pdf"
//             required
//           />
//         </label>

//         <label>
//           Years of experience
//           <input
//             type="number"
//             name="experienceYears"
//             min="0"
//             required
//           />
//         </label>

//         <label>
//           Consultation fee (₹)
//           <input
//             type="number"
//             name="consultationFee"
//             min="0"
//             required
//           />
//         </label>

//         <label>
//           Full Address
//           <input
//             type="text"
//             name="address"
//             placeholder="City / District / State"
//             required
//           />
//         </label>

//         <button type="submit" disabled={loading}>
//           {loading
//             ? "Submitting..."
//             : "Create Doctor Account"}
//         </button>

//         {message && (
//           <p role="status">{message}</p>
//         )}
//       </form>
//     </main>
//   );
// }


import { useState } from "react";
import "./DoctorSignup.css";

export default function DoctorSignup() {
  const [imagePreview, setImagePreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setImagePreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Profile image must be less than 2 MB.");
      event.target.value = "";
      return;
    }

    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register/doctor", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed.");
      }

      setMessage(
        "Registration submitted! Your account is awaiting admin verification."
      );

      form.reset();
      setImagePreview("");
    } catch (error) {
      setMessage(
        error.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="doctor-signup-page">
      <div className="doctor-signup-wrapper">
        <div className="doctor-signup-heading">
          <div className="doctor-signup-eyebrow">
            <span className="doctor-signup-eyebrow-dot"></span>
            DOCTOR REGISTRATION
          </div>

          <h1>
            Create your doctor <span>account.</span>
          </h1>

          <p>
            Join MedQueue to manage appointments and connect with
            patients. Complete your professional details below.
          </p>
        </div>

        <div className="doctor-signup-card">
          <div className="doctor-signup-card-heading">
            <div>
              <span className="doctor-signup-step">STEP 01</span>
              <h2>Professional information</h2>
              <p>Enter your details exactly as they appear on your documents.</p>
            </div>

            <div className="doctor-signup-medical-icon" aria-hidden="true">
              ✚
            </div>
          </div>

          <form
            className="doctor-signup-form"
            onSubmit={handleSubmit}
          >
            <div className="doctor-signup-section-title">
              <span className="doctor-signup-section-number">01</span>
              <div>
                <h3>Profile details</h3>
                <p>Your identity and account credentials</p>
              </div>
            </div>

            <div className="doctor-signup-grid">
              <div className="doctor-signup-field doctor-signup-full">
                <label htmlFor="profileImage">Profile image</label>

                <div className="doctor-signup-upload">
                  <div className="doctor-signup-avatar">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Doctor profile preview" />
                    ) : (
                      <span>✚</span>
                    )}
                  </div>

                  <div className="doctor-signup-upload-info">
                    <strong>Upload your profile photo</strong>
                    <p>JPG, PNG or another image format · Max 2 MB</p>

                    <label
                      className="doctor-signup-file-button"
                      htmlFor="profileImage"
                    >
                      Choose image
                    </label>
                  </div>

                  <input
                    className="doctor-signup-file-input"
                    id="profileImage"
                    type="file"
                    name="profileImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                  />
                </div>
              </div>

              <div className="doctor-signup-field">
                <label htmlFor="doctorName">Full name</label>
                <input
                  id="doctorName"
                  type="text"
                  name="name"
                  placeholder="Dr. Your Name"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="doctor-signup-field">
                <label htmlFor="doctorEmail">Email address</label>
                <input
                  id="doctorEmail"
                  type="email"
                  name="email"
                  placeholder="doctor@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="doctor-signup-field doctor-signup-full">
                <label htmlFor="doctorPassword">Password</label>
                <input
                  id="doctorPassword"
                  type="password"
                  name="password"
                  placeholder="Create a secure password"
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
                <small>Use at least 8 characters.</small>
              </div>
            </div>

            <div className="doctor-signup-divider"></div>

            <div className="doctor-signup-section-title">
              <span className="doctor-signup-section-number">02</span>
              <div>
                <h3>Medical qualifications</h3>
                <p>Your specialization and professional credentials</p>
              </div>
            </div>

            <div className="doctor-signup-grid">
              <div className="doctor-signup-field">
                <label htmlFor="specialization">Specialization</label>
                <input
                  id="specialization"
                  type="text"
                  name="specialization"
                  placeholder="e.g. Cardiologist"
                  required
                />
              </div>

              <div className="doctor-signup-field">
                <label htmlFor="qualification">Qualification</label>
                <input
                  id="qualification"
                  type="text"
                  name="qualification"
                  placeholder="e.g. MBBS, MD"
                  required
                />
              </div>

              <div className="doctor-signup-field doctor-signup-full">
                <label htmlFor="degreeCertificate">Degree certificate</label>
                <div className="doctor-signup-document">
                  <span className="doctor-signup-document-icon">↥</span>
                  <div>
                    <strong>Upload degree certificate</strong>
                    <small>Image or PDF file</small>
                  </div>
                  <input
                    id="degreeCertificate"
                    type="file"
                    name="degreeCertificate"
                    accept="image/*,.pdf"
                    required
                  />
                </div>
              </div>

              <div className="doctor-signup-field doctor-signup-full">
                <label htmlFor="medicalRegistrationNumber">
                  Medical registration number
                </label>
                <input
                  id="medicalRegistrationNumber"
                  type="text"
                  name="medicalRegistrationNumber"
                  placeholder="Enter your registration number"
                  required
                />
              </div>

              <div className="doctor-signup-field doctor-signup-full">
                <label htmlFor="registrationCertificate">
                  Medical registration certificate
                </label>
                <div className="doctor-signup-document">
                  <span className="doctor-signup-document-icon">↥</span>
                  <div>
                    <strong>Upload registration certificate</strong>
                    <small>Image or PDF file</small>
                  </div>
                  <input
                    id="registrationCertificate"
                    type="file"
                    name="registrationCertificate"
                    accept="image/*,.pdf"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="doctor-signup-divider"></div>

            <div className="doctor-signup-section-title">
              <span className="doctor-signup-section-number">03</span>
              <div>
                <h3>Practice details</h3>
                <p>Help patients understand your services</p>
              </div>
            </div>

            <div className="doctor-signup-grid">
              <div className="doctor-signup-field">
                <label htmlFor="experienceYears">
                  Years of experience
                </label>
                <input
                  id="experienceYears"
                  type="number"
                  name="experienceYears"
                  placeholder="e.g. 5"
                  min="0"
                  required
                />
              </div>

              <div className="doctor-signup-field">
                <label htmlFor="consultationFee">
                  Consultation fee (₹)
                </label>
                <input
                  id="consultationFee"
                  type="number"
                  name="consultationFee"
                  placeholder="e.g. 500"
                  min="0"
                  required
                />
              </div>

              <div className="doctor-signup-field doctor-signup-full">
                <label htmlFor="referralCode">Agent / Referral Code (Optional)</label>
                <input
                  id="referralCode"
                  type="text"
                  name="referralCode"
                  placeholder="Enter agent referral code"
                  autoComplete="off"
                />
              </div>

              <div className="doctor-signup-field doctor-signup-full">
                <label htmlFor="doctorAddress">Full address</label>
                <input
                  id="doctorAddress"
                  type="text"
                  name="address"
                  placeholder="City / District / State"
                  autoComplete="street-address"
                  required
                />
              </div>
            </div>

            <div className="doctor-signup-note">
              <span>ⓘ</span>
              <p>
                Your account will remain pending until the administrator
                verifies your professional documents.
              </p>
            </div>

            {message && (
              <div
                className={`doctor-signup-message ${
                  message.startsWith("Registration submitted!")
                    ? "doctor-signup-success"
                    : "doctor-signup-error"
                }`}
                role="status"
              >
                {message}
              </div>
            )}

            <button
              className="doctor-signup-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Submitting registration..." : "Create Doctor Account"}
              {!loading && <span>→</span>}
            </button>

            <p className="doctor-signup-privacy">
              By registering, you agree to provide accurate professional
              information for verification.
            </p>
          </form>
        </div>

        <div className="doctor-signup-footer-note">
          <span>✚</span>
          MedQueue · Healthcare, connected.
        </div>
      </div>
    </main>
  );
}




