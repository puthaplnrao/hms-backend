const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: String, // or Date
  time: String,
  status: {
    type: String,
    enum: ["booked", "scheduled", "completed", "cancelled"],
    default: "booked",
  },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
