const user = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Otp = require("../models/Otp");
const { sendOtpEmail } = require("../utils/send_email");
const { sendOtp } = require("./otp_controller");
const { generateAndSendOtp } = require("../utils/otp_service");

exports.signup = async (req, res) => {
  try {
    const { username, fullName, email, password } = req.body;

    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new user({
      username,
      password: hashedPassword,
      fullName,
      email,
    });

    await newUser.save();

    generateAndSendOtp(email).catch((err) =>
      console.error("OTP email error:", err.message),
    );

    res.json({
      success: true,
      message: "OTP sent for verification",
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateAndSendOtp(email).catch((err) =>
      console.error("OTP email error:", err.message),
    );

    res.json({
      success: true,
      message: "OTP sent",
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.verifyOtpLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ email });

    if (!record) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const isValid = await bcrypt.compare(otp, record.hashedOtp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const userData = await user.findOne({ email });

    const token = jwt.sign({ id: userData._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    await Otp.deleteMany({ email });

    res.json({
      success: true,
      token,
      user: userData,
    });
  } catch (err) {
    res.status(500).json({ message: "OTP verification failed" });
  }
};
