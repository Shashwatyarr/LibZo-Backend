const mongoose = require("mongoose");
const ClubMemberSchema = require("./ClubMemberSchema");

const BanSystemSchema = new mongoose.Schema({
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
    enum: ["temporary", "permanent"],
  },
  reason: String,
  bannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: Date,
  active: {
    type: Boolean,
    default: true,
  },
});

BanSystemSchema.index({ clubId: 1, userId: 1 });

module.exports = mongoose.model("Ban", BanSystemSchema);
