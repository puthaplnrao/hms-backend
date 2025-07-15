const express = require("express");
const router = express.Router();
const {
  getTodayAppointments,
  getRecentPatients,
} = require("../controllers/doctorController");
const verifyToken = require("../middleware/verifyToken");

// Routes protected by JWT middleware
router.get("/appointments/today", verifyToken, getTodayAppointments);
router.get("/patients/recent", verifyToken, getRecentPatients);

module.exports = router;
