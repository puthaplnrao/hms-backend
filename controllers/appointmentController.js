const Appointment = require("../models/Appointment");

// ✅ Get available 15-min slots for a doctor on a given date
exports.getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) {
    return res.status(400).json({ message: "Doctor and date required" });
  }

  const startHour = 9;
  const endHour = 17;
  const interval = 15;

  // Generate slots
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      slots.push({ time, isBooked: false });
    }
  }

  // Fetch booked slots
  const bookedAppointments = await Appointment.find({ doctorId, date });
  const bookedTimes = bookedAppointments.map((appt) => appt.time);

  // Mark booked slots
  const updatedSlots = slots.map((slot) => ({
    ...slot,
    isBooked: bookedTimes.includes(slot.time),
  }));

  res.json(updatedSlots);
};
