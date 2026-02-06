const Book = require("../models/Book");

// ===== COMMON HELPERS =====

const DEFAULT_LIMIT = 40;

const getPagination = (req) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || DEFAULT_LIMIT;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

// Sorting Rule:
// 1. popularityScore DESC
// 2. if equal → reviewsCount DESC
const getSort = () => {
  return {
    popularityScore: -1,
    reviewsCount: -1,
  };
};

// ======================================================
// 1. ALL BOOKS PAGE
// GET /api/library/all
// ======================================================

exports.getAllBooks = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const books = await Book.find().sort(getSort()).skip(skip).limit(limit);

    const total = await Book.countDocuments();

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      data: books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// 2. TRENDING PAGE
// GET /api/library/trending
// ======================================================

exports.getTrending = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const books = await Book.find().sort(getSort()).skip(skip).limit(limit);

    const total = await Book.countDocuments();

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      data: books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// 3. GET ALL CATEGORIES
// GET /api/library/categories
// ======================================================

exports.getCategories = async (req, res) => {
  try {
    const categories = await Book.distinct("categories");

    res.json({
      success: true,
      default: "Fiction",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// 4. BOOKS BY CATEGORY
// GET /api/library/category/:name
// Default → Fiction
// ======================================================

exports.getByCategory = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const category = req.params.name || "Fiction";

    const books = await Book.find({
      categories: category,
    })
      .sort(getSort())
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments({
      categories: category,
    });

    res.json({
      success: true,
      category,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      data: books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// 5. SINGLE BOOK DETAIL
// GET /api/library/book/:id
// ======================================================

exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.json({
      success: true,
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===== INCREASE POPULARITY =====
exports.increasePopularity = async (req, res) => {
  try {
    const id = req.params.id;

    const book = await Book.findByIdAndUpdate(
      id,
      { $inc: { popularityScore: 1 } },
      { new: true },
    );
    console.log("Updated Popularity:", book.popularityScore);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.json({
      success: true,
      popularity: book.popularityScore,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};
