const mongoose = require("mongoose");

const ClubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    genre: [
      {
        type: String,
      },
    ],
    type: {
      type: String,
      enum: ["public", "private", "paid"],
      default: "public",
    },
    currentBook: {
      bookId: String,
      title: String,
      cover: String,
    },
    stats: {
      members: { type: Number, default: 0 },
      post: { type: Number, default: 0 },
      activeToday: { type: Number, default: 0 },
    },
    settings: {
      allowPosting: { type: Boolean, default: true },
      allowVoice: { type: Boolean, default: false },
      allowPolls: { type: Boolean, default: false },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

ClubSchema.index({ name: 1 });
ClubSchema.index({ genre: 1 });

module.exports = mongoose.model("Club", ClubSchema);
