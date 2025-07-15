const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes"); // 👈 Add more as needed
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const { accessLogger, requestLogger } = require("./logger/logger");

const app = express();

// ─────────────────────────────────────
// ✅ Middleware
// ─────────────────────────────────────
app.use(cors());
app.use(express.json());

// ✅ Helmet Security Config
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        objectSrc: ["'none'"],
      },
    },
    referrerPolicy: { policy: "no-referrer" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    xssFilter: true,
    frameguard: { action: "deny" },
  })
);

// ✅ Logging
app.use(accessLogger);
app.use(requestLogger);

// ✅ Rate Limiting (Optional for login route)
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute
  message: { error: "Too many requests, please try again later." },
});
app.enable("trust proxy");

// ─────────────────────────────────────
// ✅ Routes
// ─────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/patients", patientRoutes);

// ─────────────────────────────────────
// ✅ 404 Fallback
// ─────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// ─────────────────────────────────────
// ✅ Error Handler
// ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ message: "Server error" });
});

// ─────────────────────────────────────
// ✅ MongoDB + Server Start
// ─────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () =>
      console.log(`✅ Server running → http://${process.env.SERVER}:${PORT}`)
    )
  )
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
