const express = require("express");
const router = express.Router();

const {
  getAllBooks,
  getTrending,
  getCategories,
  getByCategory,
  getBook,
} = require("../controllers/library_controller");

const { searchBooks } = require("../controllers/book_searchcontroller");

// All books page
// GET /api/library/all
router.get("/all", getAllBooks);

// Trending page
// GET /api/library/trending
router.get("/trending", getTrending);

// List of categories
// GET /api/library/categories
router.get("/categories", getCategories);

// Books by category (default Fiction handled in controller)
// GET /api/library/category/:name
router.get("/category/:name", getByCategory);

// Single book detail
// GET /api/library/book/:id
router.get("/book/:id", getBook);

//search books
//GET /api/library/search?q=searchTerm
router.get("/search", searchBooks);

module.exports = router;
