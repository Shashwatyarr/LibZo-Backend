const mongoose = require("mongoose");

const ClubMemberSchema = new mongoose.Schema(
  {
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    role: {
      type: String,
      enum: ["admin", "member", "moderator"],
      default: "member",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    lastSeen: {
      Date,
    },
    mute: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

ClubMemberSchema.index({ clubId: 1, userId: 1 });

module.exports = mongoose.model("ClubMember", ClubMemberSchema);
