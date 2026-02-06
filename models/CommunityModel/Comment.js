const mongoose = require("mongoose");

const PostCommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClubPost",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    text: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("PostComment", PostCommentSchema);
