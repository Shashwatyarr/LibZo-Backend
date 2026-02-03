const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  hashedOtp: {
    type: String,
    required: true,
  },

  expiresAt: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Otp", OtpSchema);
