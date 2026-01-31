const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // ---------- BOOK INFO ----------
  title: { type: String, required: true },
  author: { type: String },
  isbn: { type: String },
  coverImage: { type: String },
  genre: [{ type: String }],
  totalPages: { type: Number },

  // ---------- SOURCE ----------
  source: {
    type: String,
    enum: ["manual", "isbn", "kindle"],
    default: "manual",
  },

  // ---------- OWNERSHIP ----------
  ownershipType: {
    type: String,
    enum: ["owned", "rented", "wishlist"],
    default: "owned",
  },

  // ---------- READING STATUS ----------
  readingStatus: {
    type: String,
    enum: ["not-started", "reading", "completed"],
    default: "not-started",
  },

  currentPage: { type: Number, default: 0 },

  // ---------- PROGRESS HISTORY ----------
  sessions: [
    {
      startTime: Date,
      endTime: Date,
      pagesRead: Number,
      mood: {
        type: String,
        enum: ["happy", "sad", "focused", "tired", "excited"],
      },
    },
  ],

  startedAt: Date,
  completedAt: Date,

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Book", BookSchema);
