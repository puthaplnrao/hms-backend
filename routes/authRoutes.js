const express = require("express");
const { body } = require("express-validator");
const validateRequest = require("../middleware/validate");
const { register, login } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Min 6 chars password"),
    body("role")
      .optional()
      .isIn(["patient", "doctor"])
      .withMessage("Invalid role"),
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [
    body("email").notEmpty().withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    body("role")
      .optional()
      .isIn(["patient", "doctor"])
      .withMessage("Invalid role"),
  ],
  validateRequest,
  login
);

module.exports = router;
