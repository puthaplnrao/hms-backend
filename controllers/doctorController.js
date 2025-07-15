const Appointment = require("../models/Appointment");
const User = require("../models/User");
const moment = require("moment");

// ✅ Today's Appointments
exports.getTodayAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const today = moment().format("YYYY-MM-DD");

    const appointments = await Appointment.find({
      doctorId,
      date: today,
      status: { $ne: "cancelled" },
    })
      .populate("patientId", "profile.fullName email")
      .sort({ time: 1 });

    const result = appointments.map((appt) => ({
      id: appt._id,
      patient: appt.patientId?.profile?.fullName || appt.patientId?.email,
      time: appt.time,
      reason: appt.reason || "N/A",
    }));
    console.log("Today's Appointments: ", result);
    res.json(result);
  } catch (err) {
    console.error("Error fetching today's appointments:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Recent Patients (last 7 unique patients)
exports.getRecentPatients = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const appointments = await Appointment.find({
      doctorId,
      status: { $ne: "cancelled" },
    })
      .populate("patientId", "profile.fullName email")
      .sort({ date: -1, time: -1 });

    // Get unique patient list
    const seen = new Set();
    const recentPatients = [];

    for (let appt of appointments) {
      const pid = appt.patientId?._id.toString();
      if (!seen.has(pid)) {
        seen.add(pid);
        recentPatients.push({
          id: pid,
          name: appt.patientId?.profile?.fullName || appt.patientId?.email,
          lastVisit: appt.date,
        });
      }
      if (recentPatients.length >= 7) break;
    }

    res.json(recentPatients);
  } catch (err) {
    console.error("Error fetching recent patients:", err);
    res.status(500).json({ message: "Server error" });
  }
};
