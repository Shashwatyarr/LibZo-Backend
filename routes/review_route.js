const express = require("express");
const router = express.Router();

const {
  addReview,
  getReviews,
  toggleLike,
} = require("../controllers/review_controller");
const auth = require("../middleware/auth");

// ===== REVIEW ROUTES =====

// Add or update review (rating + comment)
// POST /api/review
router.post("/", auth, addReview);

// Get reviews of a book with pagination & sorting
// GET /api/review/:id?page=1
router.get("/:id", auth, getReviews);

// Like / Unlike a review
// POST /api/review/like/:id
router.post("/like/:id", auth, toggleLike);

module.exports = router;
