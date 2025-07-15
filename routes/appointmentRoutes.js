const express = require("express");
const router = express.Router();
const { getAvailableSlots } = require("../controllers/appointmentController");
const Appointment = require("../models/Appointment");
const auth = require("../middleware/authMiddleware");

router.get("/available-slots", getAvailableSlots);
// POST /api/appointments/book
router.post("/book", async (req, res) => {
  const { doctorId, patientId, date, time } = req.body;

  if (!doctorId || !patientId || !date || !time) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const existing = await Appointment.findOne({ doctorId, date, time });
  if (existing) {
    return res.status(409).json({ message: "Slot already booked" });
  }

  const newAppointment = new Appointment({
    _id: null,
    doctorId,
    patientId,
    date,
    time,
    status: "booked",
  });

  await newAppointment.save();
  res.status(201).json({ message: "Appointment booked successfully" });
});

router.get("/mine", auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.user.id,
    })
      .populate("doctorId", "profile.fullName email")
      .sort({ date: -1, time: 1 });

    const formatted = appointments.map((appt) => ({
      _id: appt._id,
      date: appt.date,
      time: appt.time,
      status: appt.status,
      doctorName:
        appt.doctorId?.profile?.fullName || appt.doctorId?.email || "Unknown",
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error in /appointments/mine:", err);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

router.patch("/:id/cancel", auth, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only the patient who booked can cancel
    if (appt.patientId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update status to cancelled
    appt.status = "cancelled";
    await appt.save();

    res.json({ message: "Appointment cancelled successfully", appt });
  } catch (err) {
    console.error("Cancel error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", auth, async (req, res) => {
  const { time } = req.body;
  const appt = await Appointment.findById(req.params.id);

  if (!appt || appt.patientId.toString() !== req.user.id)
    return res.status(403).json({ message: "Unauthorized" });

  appt.time = time;
  await appt.save();

  res.json({ message: "Appointment updated" });
});

module.exports = router;
