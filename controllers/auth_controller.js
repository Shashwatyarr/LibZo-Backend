const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Otp = require("../models/Otp");

const { generateAndSendOtp } = require("../utils/otp_service");

// ───── SIGNUP ─────
exports.signup = async (req, res) => {
  try {
    const { username, fullName, email, password, telegramUsername } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      fullName,
      email,
      password: hashedPassword,

      telegram: {
        telegramUsername: telegramUsername,
        chatId: null,
      },
    });

    await newUser.save();

    res.json({
      telegramLink: `https://t.me/libzo_auth_bot?start=${username}`,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ───── LOGIN STEP 1 ─────
exports.login = async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await User.findOne({ username });

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

  res.json({
    success: true,
    message: "Credentials correct. Proceed with OTP.",
  });
};

// ───── TELEGRAM STATUS ─────
exports.telegramStatus = async (req, res) => {
  const { username } = req.params;

  const u = await User.findOne({ username });

  res.json({
    linked: !!u?.telegram?.chatId,
  });
};

// ───── REQUEST OTP ─────
exports.requestOtp = async (req, res) => {
  const { username } = req.body;

  const u = await User.findOne({ username });

  if (!u?.telegram?.chatId) {
    return res.status(400).json({
      message: "Please open Telegram and press START first",
    });
  }

  await generateAndSendOtp(username);

  res.json({
    success: true,
    message: "OTP sent on Telegram",
  });
};

// ───── VERIFY OTP + LOGIN ─────
exports.verifyOtpLogin = async (req, res) => {
  const { username, otp } = req.body;

  const record = await Otp.findOne({ username });

  if (!record) {
    return res.status(400).json({ message: "OTP expired" });
  }

  const isValid = await bcrypt.compare(otp, record.hashedOtp);

  if (!isValid) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const userData = await User.findOne({ username });

  const token = jwt.sign({ id: userData._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  await Otp.deleteMany({ username });

  res.json({
    success: true,
    token,
    user: userData,
  });
};
