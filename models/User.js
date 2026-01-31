const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  // ---------- AUTH ----------
  username: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // optional if google login
  googleId: { type: String, default: null },

  // ---------- PROFILE ----------
  profile: {
    bio: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    location: { type: String, default: "" },
    dateOfBirth: { type: Date },
    favoriteGenres: [{ type: String }],
    preferredLanguage: { type: String, default: "English" },
  },

  // ---------- READING PREFERENCES ----------
  readingPreferences: {
    preferredReadingHours: [{ type: String }],
    readingGoalPerYear: { type: Number },
    avgReadingSpeed: { type: Number },
  },

  // ---------- CONNECTED ACCOUNTS ----------
  integrations: {
    kindleConnected: { type: Boolean, default: false },
    kindleEmail: { type: String },
  },

  // ---------- USER LIBRARY ----------
  library: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
  ],

  // ---------- ANALYTICS (CACHEABLE) ----------
  analytics: {
    totalBooksRead: { type: Number, default: 0 },
    totalPagesRead: { type: Number, default: 0 },
    avgSessionTime: { type: Number, default: 0 },
    moodStats: [
      {
        mood: String,
        count: Number,
      },
    ],
    genreHeatmap: [
      {
        genre: String,
        pagesRead: Number,
      },
    ],
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
