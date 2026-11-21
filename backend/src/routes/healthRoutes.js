const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MedQueue API is healthy",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

module.exports = router;
