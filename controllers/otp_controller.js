const { generateAndSendOtp } = require("../utils/otp_service");

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    await generateAndSendOtp(email);

    res.json({
      success: true,
      message: "OTP sent",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error sending OTP",
      error: err.message,
    });
  }
};
