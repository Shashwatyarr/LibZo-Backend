const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const { sendOtpEmail } = require("./send_email");

exports.generateAndSendOtp = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  console.log("Generated OTP:", otp); //developing phase tk hi h

  const hashedOtp = await bcrypt.hash(otp, 10);

  await Otp.deleteMany({ email });

  await Otp.create({
    email,
    hashedOtp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  await sendOtpEmail(email, otp);
};
