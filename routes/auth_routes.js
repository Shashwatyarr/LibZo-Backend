const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth_controller");

// 1️⃣ Signup (same rahega – tumhara existing)
router.post("/signup", authController.signup);

// 2️⃣ Login step 1 – username do
router.post("/login", authController.login);

// 3️⃣ NEW ➜ Check Telegram linked?
router.get("/telegram-status/:username", authController.telegramStatus);

// 4️⃣ NEW ➜ OTP request via Telegram
router.post("/request-otp", authController.requestOtp);

// 5️⃣ OTP verify + final login
router.post("/verify-otp", authController.verifyOtpLogin);

module.exports = router;
