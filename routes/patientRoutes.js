const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");

// @route GET /api/patients
// @desc  Get all patients
// @access Protected (Doctor/Admin only)
router.get("/", verifyToken, async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" })
      .select("-password") // exclude password
      .sort({ createdAt: -1 }); // newest first
    res.json(patients);
  } catch (err) {
    console.error("Fetch patients error:", err);
    res.status(500).json({ message: "Error fetching patients" });
  }
});

module.exports = router;
