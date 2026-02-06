const Book = require("../models/Book");
const OpenLibrary = require("../utils/openlibrary.service");
const Inserter = require("../utils/seedInserter");

exports.searchBooks = async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({
      success: false,
      message: "Search query required",
    });
  }

  // 1. Local search
  const local = await Book.find(
    {
      $text: { $search: query },
    },

    { score: { $meta: "textScore" } },
  )
    .sort({
      score: { $meta: "textScore" },
      popularityScore: -1,
      reviewsCount: -1,
    })
    .limit(40);

  if (local.length > 0) {
    return res.json({
      success: true,
      source: "local",
      data: local,
    });
  }

  // 2. OpenLibrary fallback
  const ol = await OpenLibrary.searchByText(query);

  if (ol.length === 0) {
    return res.json({
      success: true,
      source: "none",
      data: [],
    });
  }

  // 3. Save to DB
  const result = await Inserter.insertBooks(ol);

  // 4. Return fresh from DB
  const saved = await Book.find({
    $text: { $search: query },
  }).limit(40);

  res.json({
    success: true,
    source: "openlibrary",
    inserted: result,
    data: saved,
  });
};
