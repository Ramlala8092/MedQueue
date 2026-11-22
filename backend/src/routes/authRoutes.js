
const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

// ==========================================
// MULTER CONFIGURATION
// ==========================================

const storage = multer.memoryStorage();

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

    return cb(new Error("Invalid file type."));
  },
});

// ==========================================
// CLOUDINARY UPLOAD HELPER
// ==========================================

const uploadToCloudinary = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: "image",
        type: options.type || "upload",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });
};

// ==========================================
// CLOUDINARY CLEANUP HELPER
// ==========================================

const deleteCloudinaryAssets = async (assets) => {
  for (const asset of assets) {
    try {
      await cloudinary.uploader.destroy(asset.publicId, {
        resource_type: "image",
        type: asset.type,
      });
    } catch (error) {
      console.error("Cloudinary cleanup error:", error);
    }
  }
};

// ==========================================
// DOCTOR SIGNUP
// POST /api/auth/register/doctor
// ==========================================

router.post(
  "/register/doctor",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "degreeCertificate", maxCount: 1 },
    { name: "registrationCertificate", maxCount: 1 },
  ]),
  async (req, res) => {
    let createdUserId = null;
    const uploadedAssets = [];

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

      // Required field validation
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

      // Check duplicate email
      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }

      // Check duplicate medical registration number
      const existingRegistration = await Doctor.findOne({
        medicalRegistrationNumber: normalizedRegistration,
      });

      if (existingRegistration) {
        return res.status(409).json({
          success: false,
          message: "This medical registration number is already registered.",
        });
      }

      // Upload public profile image
      const profileUpload = await uploadToCloudinary(
        files.profileImage[0],
        {
          folder: "medqueue/profile-images",
          type: "upload",
        }
      );

      uploadedAssets.push({
        publicId: profileUpload.public_id,
        type: "upload",
      });

      // Upload private degree certificate
      const degreeUpload = await uploadToCloudinary(
        files.degreeCertificate[0],
        {
          folder: "medqueue/private-certificates",
          type: "authenticated",
        }
      );

      uploadedAssets.push({
        publicId: degreeUpload.public_id,
        type: "authenticated",
      });

      // Upload private registration certificate
      const registrationUpload = await uploadToCloudinary(
        files.registrationCertificate[0],
        {
          folder: "medqueue/private-certificates",
          type: "authenticated",
        }
      );

      uploadedAssets.push({
        publicId: registrationUpload.public_id,
        type: "authenticated",
      });

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create doctor user
      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "doctor",
      });

      createdUserId = user._id;

      // Create doctor profile
      await Doctor.create({
        user: user._id,
        name: name.trim(),
        specialization: specialization.trim(),
        qualification: qualification.trim(),
        experienceYears: years,
        consultationFee: fee,
        address: address.trim(),

        // Public profile image
        profileImage: profileUpload.secure_url,
        profileImagePublicId: profileUpload.public_id,

        // Private degree certificate
        degreeCertificate: degreeUpload.public_id,
        degreeCertificatePublicId: degreeUpload.public_id,
        degreeCertificateFormat: degreeUpload.format || "",

        medicalRegistrationNumber: normalizedRegistration,

        // Private registration certificate
        registrationCertificate: registrationUpload.public_id,
        registrationCertificatePublicId: registrationUpload.public_id,
        registrationCertificateFormat: registrationUpload.format || "",

        verificationStatus: "pending",
        isVerified: false,

        referralCode:
          typeof referralCode === "string"
            ? referralCode.trim().toUpperCase()
            : "",
      });

      return res.status(201).json({
        success: true,
        message:
          "Registration submitted. Your account is awaiting admin verification.",
      });
    } catch (error) {
      console.error("Doctor registration error:", error);

      // Remove user if doctor creation failed
      if (createdUserId) {
        try {
          await User.findByIdAndDelete(createdUserId);
        } catch (cleanupError) {
          console.error("User cleanup failed:", cleanupError);
        }
      }

      // Remove uploaded Cloudinary files
      await deleteCloudinaryAssets(uploadedAssets);

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

// ==========================================
// DOCTOR AND PATIENT LOGIN
// POST /api/auth/login
// ==========================================

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (
      !email?.trim() ||
      !password ||
      !["doctor", "patient"].includes(role)
    ) {
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

    // Doctor approval check
    if (role === "doctor") {
      const doctor = await Doctor.findOne({
        user: user._id,
      });

      if (
        !doctor ||
        doctor.verificationStatus !== "approved" ||
        !doctor.isVerified ||
        doctor.isActive === false
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Your doctor account is pending approval or is not active.",
        });
      }
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

// ==========================================
// ADMIN LOGIN
// POST /api/auth/admin/login
// ==========================================

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

// ==========================================
// PATIENT SIGNUP
// POST /api/auth/register/patient
// ==========================================

router.post("/register/patient", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password ||
      !phone?.trim()
    ) {
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

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error.",
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
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
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

// ==========================================
// LOGGED-IN DOCTOR PROFILE
// GET /api/auth/doctor/profile
// ==========================================

router.get("/doctor/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error.",
      });
    }

    const token = authHeader.split(" ")[1];

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

    // Never expose private certificate IDs in doctor profile response
    const doctorData = doctor.toObject();

    delete doctorData.degreeCertificate;
    delete doctorData.degreeCertificatePublicId;
    delete doctorData.degreeCertificateFormat;

    delete doctorData.registrationCertificate;
    delete doctorData.registrationCertificatePublicId;
    delete doctorData.registrationCertificateFormat;

    return res.status(200).json({
      success: true,
      doctor: {
        ...doctorData,
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

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;