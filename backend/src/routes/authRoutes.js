
const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const User = require("../models/User");
const Doctor = require("../models/Doctor");

const router = express.Router();

// Upload directories
const profileDir = path.join(
  __dirname,
  "../../uploads/profile-images"
);

const documentsDir = path.join(
  __dirname,
  "../../uploads/private-documents"
);

fs.mkdirSync(profileDir, { recursive: true });
fs.mkdirSync(documentsDir, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "profileImage") {
      cb(null, profileDir);
    } else {
      cb(null, documentsDir);
    }
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    cb(null, safeName);
  },
});

// File upload validation
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 3,
  },

  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    const isPdf = file.mimetype === "application/pdf";

    if (file.fieldname === "profileImage" && isImage) {
      return cb(null, true);
    }

    if (
      ["degreeCertificate", "registrationCertificate"].includes(
        file.fieldname
      ) &&
      (isImage || isPdf)
    ) {
      return cb(null, true);
    }

    cb(new Error("Invalid file type."));
  },
});

// ==================================================
// DOCTOR SIGNUP
// POST /api/auth/register/doctor
// ==================================================

router.post(
  "/register/doctor",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "degreeCertificate", maxCount: 1 },
    { name: "registrationCertificate", maxCount: 1 },
  ]),
  async (req, res) => {
    let createdUserId = null;

    try {
      const {
        name,
        email,
        password,
        specialization,
        qualification,
        experienceYears,
        consultationFee,
        address,
        medicalRegistrationNumber,
        referralCode = "",
      } = req.body;

      const files = req.files || {};

      if (
        !name?.trim() ||
        !email?.trim() ||
        !password ||
        !specialization?.trim() ||
        !qualification?.trim() ||
        experienceYears === undefined ||
        experienceYears === "" ||
        consultationFee === undefined ||
        consultationFee === "" ||
        !address?.trim() ||
        !medicalRegistrationNumber?.trim() ||
        !files.profileImage?.[0] ||
        !files.degreeCertificate?.[0] ||
        !files.registrationCertificate?.[0]
      ) {
        return res.status(400).json({
          success: false,
          message: "Please complete all fields and upload all documents.",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters.",
        });
      }

      const years = Number(experienceYears);
      const fee = Number(consultationFee);

      if (
        !Number.isFinite(years) ||
        years < 0 ||
        !Number.isFinite(fee) ||
        fee < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Experience and consultation fee must be valid numbers.",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedRegistration = medicalRegistrationNumber.trim();

      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }

      const existingRegistration = await Doctor.findOne({
        medicalRegistrationNumber: normalizedRegistration,
      });

      if (existingRegistration) {
        return res.status(409).json({
          success: false,
          message: "This medical registration number is already registered.",
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "doctor",
      });

      createdUserId = user._id;

      await Doctor.create({
        user: user._id,
        name: name.trim(),
        specialization: specialization.trim(),
        qualification: qualification.trim(),
        experienceYears: years,
        consultationFee: fee,
        address: address.trim(),

        profileImage: `/uploads/profile-images/${files.profileImage[0].filename}`,
        degreeCertificate: files.degreeCertificate[0].filename,
        medicalRegistrationNumber: normalizedRegistration,
        registrationCertificate: files.registrationCertificate[0].filename,

        verificationStatus: "pending",
        isVerified: false,
        referralCode: typeof referralCode === "string" ? referralCode.trim().toUpperCase() : "",
      });

      return res.status(201).json({
        success: true,
        message:
          "Registration submitted. Your account is awaiting admin verification.",
      });
    } catch (error) {
      console.error("Doctor registration error:", error);

      // Remove the user if doctor creation fails
      if (createdUserId) {
        try {
          await User.findByIdAndDelete(createdUserId);
        } catch (cleanupError) {
          console.error("User cleanup failed:", cleanupError);
        }
      }

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "This email or registration number is already registered.",
        });
      }

      if (error instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: "File upload failed. Each file must be no larger than 5 MB.",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Doctor registration failed. Please try again.",
      });
    }
  }
);




/* DOCTOR AND PATIENT LOGIN
   POST /api/auth/login
*/

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email?.trim() || !password || !["doctor", "patient"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Email, password and valid account type are required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role,
    }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email, password or account type.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email, password or account type.",
      });
    }

    let doctor = null;

    if (role === "doctor") {
      doctor = await Doctor.findOne({ user: user._id });

      if (!doctor || doctor.verificationStatus !== "approved" ||
          !doctor.isVerified || doctor.isActive === false) {
        return res.status(403).json({
          success: false,
          message: "Your doctor account is pending approval or is not active.",
        });
      }
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});

// ==================================================
// ADMIN LOGIN
// POST /api/auth/admin/login
// ==================================================

router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from environment variables.");

      return res.status(500).json({
        success: false,
        message: "Server configuration error.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role: "admin",
    }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});



/* PATIENT SIGNUP
   POST /api/auth/register/patient
*/

router.post("/register/patient", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name?.trim() || !email?.trim() || !password || !phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: "Server configuration error." });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone.trim(),
      role: "patient",
    });

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return res.status(201).json({
      success: true,
      message: "Patient account created successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Patient registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Patient registration failed. Please try again.",
    });
  }
});


// GET: Logged-in doctor's profile
router.get("/doctor/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded.userId,
      role: "doctor",
    }).select("name email phone role");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Doctor account not found.",
      });
    }

    const doctor = await Doctor.findOne({
      user: user._id,
      verificationStatus: "approved",
      isVerified: true,
      isActive: true,
    });

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: "Doctor account is not approved or active.",
      });
    }

    return res.status(200).json({
      success: true,
      doctor: {
        ...doctor.toObject(),
        name: doctor.name || user.name,
        email: user.email,
        phone: user.phone || "",
      },
    });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    console.error("Doctor profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load doctor profile.",
    });
  }
});


module.exports = router;