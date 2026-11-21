
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home.jsx";
import Signup from "./pages/Signup.jsx";
import DoctorSignup from "./pages/DoctorSignup.jsx";
import PatientSignup from "./pages/PatientSignup.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import Login from "./pages/Login.jsx";
import DoctorLogin from "./pages/DoctorLogin.jsx";
import PatientLogin from "./pages/PatientLogin.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import PatientDashboard from "./pages/PatientDashboard.jsx";
import BookAppointment from "./pages/BookAppointment.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import About from "./pages/About.jsx";
import Services from "./pages/Services";
import Work from "./pages/Work";
import Terms from "./pages/Terms&Condition.jsx";
import Privacy from "./pages/Privacy.jsx";
import ScrollToTop from "./component/ScrollToTop";
import Doctors from "./pages/Doctors.jsx";




// function DoctorDashboard() {
//   return (
//     <div style={{ padding: "40px" }}>
//       <h1>Doctor Dashboard</h1>
//       <p>Welcome, Doctor!</p>
//     </div>
//   );
// }

// function PatientDashboard() {
//   return (
//     <div style={{ padding: "40px" }}>
//       <h1>Patient Dashboard</h1>
//       <p>Welcome, Patient!</p>
//     </div>
//   );
// }

export default function App() {
  return (

    <>
    <ScrollToTop />

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup/doctor" element={<DoctorSignup />} />
      <Route path="/signup/patient" element={<PatientSignup />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />

      <Route path="/login" element={<Login />} />
      <Route path="/login/doctor" element={<DoctorLogin />} />
      <Route path="/login/patient" element={<PatientLogin />} />


      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      <Route path="/patient/dashboard" element={<PatientDashboard />} />


      <Route path="/book-appointment/:doctorId" element={<BookAppointment />} />
      <Route path="/chat/:appointmentId" element={<ChatPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/how-it-works" element={<Work />} />
      <Route path="/terms-and-conditions" element={<Terms />} />
      <Route path="/privacy-policy" element={<Privacy />} />
      <Route path="/doctors" element={<Doctors />} />

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
    </>

  );
}


