const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: String,
  hashedOtp: String,
  expiresAt: Date,
  purpose: String,
  tempUser: Object,
});

module.exports = mongoose.model("Otp", otpSchema);
