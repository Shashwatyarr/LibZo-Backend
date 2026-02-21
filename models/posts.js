const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    images: [
      {
        file_id: String,
        url: String,
        width: Number,
        height: Number,
        size: Number,
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    commentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
