const mongoose = require("mongoose");

const ClubPostSchema = new mongoose.Schema(
  {
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["text", "image", "quote"],
      default: "text",
    },
    content: String,
    image: String,
    stats: {
      upvotes: { type: Number, default: 0 },
      downvotes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
    },
    downvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

ClubPostSchema.index({ clubId: 1, createdAt: -1 });

// 🚀 USER PROFILE POSTS
ClubPostSchema.index({ userID: 1, createdAt: -1 });

module.exports = mongoose.model("ClubPost", ClubPostSchema);
