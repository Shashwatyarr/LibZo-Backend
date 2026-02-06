const mongoose = require("mongoose");

const ClubPollSchema = new mongoose.Schema(
  {
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
    },

    question: String,

    options: [
      {
        text: String,
        votes: { type: Number, default: 0 },
      },
    ],

    votedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ClubPoll", ClubPollSchema);
