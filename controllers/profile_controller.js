const User = require("../models/User");
const Book = require("../models/Book");
const Post = require("../models/posts");
// const {
//   findOneAndUpdate,
//   findById,
//   findByIdAndDelete,
// } = require("../models/posts");

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

exports.followUser = async (req, res) => {
  try {
    const myId = req.user.id;
    const targetId = req.params.userId;

    if (myId === targetId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const me = await User.findById(myId);
    const target = await User.findById(targetId);

    if (!target) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Already following check
    if (me.following.includes(targetId)) {
      return res.status(400).json({
        success: false,
        message: "Already following",
      });
    }

    // ✅ ONE WAY RELATION
    await User.findByIdAndUpdate(myId, {
      $addToSet: { following: targetId },
    });

    await User.findByIdAndUpdate(targetId, {
      $addToSet: { followers: myId },
    });

    res.json({
      success: true,
      message: "Followed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const myId = req.user.id;
    const targetId = req.params.userId;

    const me = await User.findById(myId);

    if (!me.following.includes(targetId)) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user",
      });
    }

    await User.findByIdAndUpdate(myId, {
      $pull: { following: targetId },
    });

    await User.findByIdAndUpdate(targetId, {
      $pull: { followers: myId },
    });

    res.json({
      success: true,
      message: "Unfollowed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).populate(
      "followers",
      "username fullName profile.profileImage",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      count: user.followers.length,
      followers: user.followers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET FOLLOWING =================
exports.getFollowing = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).populate(
      "following",
      "username fullName profile.profileImage",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      count: user.following.length,
      following: user.following,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select(
      "-password -otp -otpExpiry",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // extra stats
    const postsCount = await Post.countDocuments({
      userId: userId,
    });

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        bio: user.bio || "",
        location: user.location || "",
        profilePic: user.profilePic || null,
        followers: user.followers || [],
        following: user.following || [],
        postsCount,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + err.message,
    });
  }
};

// ================= GET USER POSTS =================
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.params.id;

    console.log("GET POSTS FOR USER:", userId);

    const posts = await Post.find({ userId: userId })
      .populate("userId", "username fullName profilePic")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (err) {
    console.log("POST FETCH ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server Error: " + err.message,
    });
  }
};
