const Review = require("../models/review");
const Book = require("../models/Book");
const mongoose = require("mongoose");

exports.addReview = async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;

    const userId = req.user._id;

    await Review.findOneAndUpdate(
      { userId, bookId },
      { rating, comment },
      { upsert: true, new: true },
    );

    const stats = await Review.aggregate([
      {
        $match: {
          bookId: new mongoose.Types.ObjectId(bookId),
        },
      },
      {
        $group: {
          _id: "$bookId",
          average: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const { average, count } = stats[0];

    await Book.findByIdAndUpdate(bookId, {
      ratings: {
        average: Number(average.toFixed(1)),
        count,
      },
      reviewsCount: count,
    });

    res.json({
      success: true,
      average,
      count,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};
// ===== GET REVIEWS WITH PAGINATION =====
exports.getReviews = async (req, res) => {
  try {
    const bookId = req.params.id;

    const page = Number(req.query.page) || 1;
    const limit = 10; // 👈 page size
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ bookId })

      // 🔥 MAIN SORT LOGIC
      .sort({
        likesCount: -1, // pehle likes
        createdAt: -1, // fir latest
      })

      .skip(skip)
      .limit(limit)

      .populate("userId", "name avatar");

    const total = await Review.countDocuments({ bookId });

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      data: reviews,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

// ===== TOGGLE LIKE =====
exports.toggleLike = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const already = review.likes.includes(userId);

    if (already) {
      // Unlike
      review.likes.pull(userId);
    } else {
      // Like
      review.likes.push(userId);
    }

    review.likesCount = review.likes.length;

    await review.save();

    res.json({
      success: true,
      liked: !already,
      likesCount: review.likesCount,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};
