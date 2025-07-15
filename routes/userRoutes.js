const express = require("express");
const router = express.Router();
const { getDoctors } = require("../controllers/userController");

router.get("/doctors", getDoctors);

module.exports = router;
