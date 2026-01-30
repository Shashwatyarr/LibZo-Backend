const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth_controller");
const otpController = require("../controllers/otp_controller");

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/send-otp", otpController.sendOtp);
router.post("/verify-otp", authController.verifyOtpLogin);

module.exports = router;
