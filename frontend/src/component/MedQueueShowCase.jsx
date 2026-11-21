
import React from "react";
import { Link } from "react-router-dom";
import "./MedQueueShowcase.css";

const stories = [
  {
    tag: "FIND BETTER CARE",
    title: "Find the Right Doctor",
    subtitle: "Healthcare that starts with the right choice.",
    description:
      "Explore doctors across different specializations, compare their experience and consultation fees, and choose the right healthcare professional for your needs.",
    image: "/image/f222.png",
    features: ["Explore specialties", "View doctor profiles", "Compare experience"],
  },
  {
    tag: "TRUSTED PROFESSIONALS",
    title: "Verified Healthcare Professionals",
    subtitle: "Connect with doctors you can trust.",
    description:
      "MedQueue provides access to doctor profiles reviewed through an admin verification process. Explore qualifications, experience and professional details before booking.",
    image: "/image/f111.png",
    features: ["Verified profiles", "Qualification details", "Professional experience"],
  },
  {
    tag: "SIMPLE BOOKING",
    title: "Book Appointments Easily",
    subtitle: "Your next appointment is just a few clicks away.",
    description:
      "Choose your preferred doctor, select an available date and time, and manage your appointment through a simple and convenient booking experience.",
    image: "/image/f33.png",
    features: ["Choose your doctor", "Select date and time", "Manage appointments"],
  },
  {
    tag: "STAY CONNECTED",
    title: "Chat with Your Doctor",
    subtitle: "Get connected beyond the clinic.",
    description:
      "Stay connected with your doctor through the MedQueue chat experience. Discuss your concerns and share relevant photos through supported chat features.",
    image: "/image/chat.png",
    features: ["Direct doctor communication", "Share photos", "Access appointment chats"],
  },
  {
    tag: "ONLINE CONSULTATION",
    title: "Consult Through Video Calls",
    subtitle: "Healthcare from wherever you are.",
    description:
      "Connect with your doctor through online video consultations when available. Get medical guidance without always needing to travel to a clinic.",
    image: "/image/f444.png",
    features: ["Online video consultation", "Convenient communication", "Remote healthcare access"],
  },
  {
    tag: "BETTER CARE EXPERIENCE",
    title: "Your Healthcare, Organised",
    subtitle: "Keep your healthcare journey in one place.",
    description:
      "Access your patient dashboard, follow appointment details and view digital prescriptions provided by your doctor through the available MedQueue features.",
    image: "/image/f333.png",
    features: ["Patient dashboard", "Appointment details", "Digital prescriptions"],
  },
];

export default function MedQueueShowcase() {
  
return (
  <section className="mq-showcase">

    <div className="mq-showcase-heading">
      <span>The MedQueue Experience</span>
      <h2>
        Healthcare made <em>simpler</em>
      </h2>
      <p>
        Discover a smarter way to find doctors, manage appointments
        and stay connected throughout your healthcare journey
      </p>
    </div>

    {/* ALL SIX CARDS IN ONE STACK */}
    <div className="mq-story-stack">

      {stories.map((story, index) => (
        <article
          className="mq-story-card"
          key={story.number}
          style={{
            "--stack-top": `${72 + index * 6}px`,
            "--card-index": index
          }}
        >

          <div className="mq-story-image">
            <img
              src={story.image}
              alt={story.title}
              loading={index === 0 ? "eager" : "lazy"}
            />
            <span className="mq-image-number">
              {story.number}
            </span>
          </div>

          <div className="mq-story-content">

            <span className="mq-story-tag">
              {story.tag}
            </span>

            <h3>{story.title}</h3>

            <h4>{story.subtitle}</h4>

            <p>{story.description}</p>

            <ul>
              {story.features.map((feature) => (
                <li key={feature}>
                  <span>✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            {/* <Link
              to="/doctors"
              className="mq-story-button"
            >
              Explore MedQueue <span>→</span>
            </Link> */}

          </div>

        </article>
      ))}

    </div>
  </section>
);
}