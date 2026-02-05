const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
    index: true,
  },

  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  likesCount: {
    type: Number,
    default: 0,
    index: true,
  },

  comment: {
    type: String,
    required: true,
    maxlength: 1000,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 1 user - 1 review per book
ReviewSchema.index({ userId: 1, bookId: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);
