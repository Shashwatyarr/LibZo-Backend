const User = require("../models/User");
const Book = require("../models/Book");
const {
  findOneAndUpdate,
  findById,
  findByIdAndDelete,
} = require("../models/posts");

const Profile_Fields = [
  "profile.bio",
  "profile.profileImage",
  "profile.location",
  "profile.dateOfBirth",
  "profile.favoriteGenres",
  "profile.preferredLanguage",
  "readingPreferences.readingGoalPerYear",
  "integrations.kindleConnected",
];

const calculateProfileCompleteness = (user) => {
  let completed = 0;

  Profile_Fields.forEach((field) => {
    const value = field.split(".").reduce((obj, key) => obj?.[key], user);

    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0)
    ) {
      completed++;
    }
  });

  return Math.round((completed / Profile_Fields.length) * 100);
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .select("-password -googleId")
      .populate("library");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    const userId = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProfileCompleteness = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const completion = calculateProfileCompleteness(user);

    res.status(200).json({
      success: true,
      completion,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserLibrary = async (req, res) => {
  try {
    const books = await Book.find({ owner: req.user.id });

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const imagePath = `/uploads/profile/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { "profile.profileImage": imagePath },
      { new: true },
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
      profileImage: imagePath,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
