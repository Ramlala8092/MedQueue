
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");

async function createAdmin() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
}

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("This email already exists. No changes made.");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
      name: "MedQueue Admin",
      email,
      passwordHash,
      role: "admin",
    });

    console.log("Admin account created successfully.");
    console.log("Email:", email);
    console.log("Change the temporary password before using this account in production.");
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();



