const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth_controller");

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.get("/telegram-status/:username", authController.telegramStatus);

router.post("/request-otp", authController.requestOtp);

router.post("/verify-otp", authController.verifyOtpLogin);

module.exports = router;
