const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const { sendOtpTelegram } = require("./send_telegram");

exports.generateAndSendOtp = async (username) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  console.log("Generated OTP:", otp); // dev phase

  const hashedOtp = await bcrypt.hash(otp, 10);

  await Otp.deleteMany({ username });

  await Otp.create({
    username,
    hashedOtp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  await sendOtpTelegram(username, otp);
};
