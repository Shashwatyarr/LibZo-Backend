const express = require("express");
const router = express.Router();

const {
  getAllBooks,
  getTrending,
  getCategories,
  getByCategory,
  getBook,
  increasePopularity,
} = require("../controllers/library_controller");

const { searchBooks } = require("../controllers/book_searchcontroller");

// All books page
// GET /library/all
router.get("/all", getAllBooks);

// Trending page
// GET /library/trending
router.get("/trending", getTrending);

// List of categories
// GET /library/categories
router.get("/categories", getCategories);

// Books by category (default Fiction handled in controller)
// GET /library/category/:name
router.get("/category/:name", getByCategory);

// Single book detail
// GET /library/book/:id
router.get("/book/:id", getBook);

//search books
//GET /library/search?q=searchTerm
router.get("/search", searchBooks);

//trending page popularity increase
//POST /library/popularity/:id
router.get("/popularity/:id", increasePopularity);

module.exports = router;
