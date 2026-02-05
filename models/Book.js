const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  // ---------- CORE IDENTITY ----------
  openLibraryId: {
    type: String,
    unique: true,
    sparse: true,
  },

  title: {
    type: String,
    required: true,
    index: true,
  },

  authors: [
    {
      name: String,
      openLibraryAuthorId: String,
    },
  ],

  isbn: [{ type: String }],

  description: String,

  coverUrl: String,

  publishYear: Number,

  totalPages: Number,

  // ---------- DISCOVERY / MARKETPLACE ----------
  categories: [
    {
      type: String,
      index: true,
    },
  ],

  tags: [String],

  language: String,

  popularityScore: {
    type: Number,
    default: 0,
    index: true,
  },

  isFeatured: {
    type: Boolean,
    default: false,
    index: true,
  },

  // ---------- SOCIAL AGGREGATION ----------
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },

  reviewsCount: {
    type: Number,
    default: 0,
  },

  // ---------- SOURCE TRACKING ----------
  source: {
    type: String,
    enum: ["seeded", "openlibrary", "manual"],
    default: "openlibrary",
  },

  // ---------- META ----------
  addedAt: {
    type: Date,
    default: Date.now,
  },

  lastSyncedAt: Date,
});

// ---------- INDEXES FOR FAST FEED ----------
BookSchema.index({
  popularityScore: -1,
  reviewsCount: -1,
});

// Text search
BookSchema.index({
  title: "text",
  "authors.name": "text",
});

module.exports = mongoose.model("Book", BookSchema);
