// const express = require("express");
// const path = require("path");
// const cors = require("cors");

// const healthRoutes = require("./routes/healthRoutes");
// const doctorRoutes = require("./routes/doctorRoutes");
// const authRoutes = require("./routes/authRoutes");
// const appointmentRoutes = require("./routes/appointmentRoutes");
// const chatRoutes = require("./routes/chatRoutes");

// const app = express();

// app.use(
//   "/uploads/profile-images",
//   express.static(
//     path.join(__dirname, "../uploads/profile-images")
//   )
// );
// app.use(cors({
//   origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
// }));
// app.use(express.json());

// app.get("/", (req, res) => {
//   res.json({ name: "MedQueue API", status: "running" });
// });

// app.use("/api/health", healthRoutes);
// app.use("/api/doctors", doctorRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/appointments", appointmentRoutes);
// app.use("/api/chat", chatRoutes);
// app.use(
//   "/uploads/profile-images",
//   express.static(
//     path.join(__dirname, "../uploads/profile-images")
//   )
// );

// app.use((req, res) => {
//   res.status(404).json({ message: "API route not found" });
// });

// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(err.status || 500).json({
//     message: err.status ? err.message : "Internal server error",
//   });
// });

// module.exports = app;




const express = require("express");
const path = require("path");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

const allowedOrigins = (
  process.env.CLIENT_ORIGIN || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());

app.use(
  "/uploads/profile-images",
  express.static(
    path.join(__dirname, "../uploads/profile-images")
  )
);

app.get("/", (req, res) => {
  res.json({
    name: "MedQueue API",
    status: "running",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/chat", chatRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.status
      ? err.message
      : "Internal server error",
  });
});

module.exports = app;
