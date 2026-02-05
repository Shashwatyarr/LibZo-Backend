require("dotenv").config();

const mongoose = require("mongoose");
const OpenLibrary = require("../utils/openlibrary.service");
const Inserter = require("../utils/seedInserter");

// ---------- CATEGORY PLAN (3000 books) ----------
const PLAN = [
  { key: "fiction", limit: 550 },
  { key: "self_help", limit: 450 },
  { key: "business", limit: 350 },
  { key: "romance", limit: 300 },
  { key: "biography", limit: 300 },

  { key: "programming", limit: 220 },
  { key: "psychology", limit: 180 },
  { key: "science", limit: 150 },
  { key: "history", limit: 120 },
  { key: "philosophy", limit: 80 },

  { key: "health", limit: 120 },
  { key: "children", limit: 80 },
  { key: "education", limit: 60 },
  { key: "poetry", limit: 40 },
];

// ---------- MAIN RUNNER ----------
async function runSeed() {
  console.log("🚀 Libzo Book Seeding Started");

  await mongoose.connect(process.env.MONGO_URI);

  let totalAdded = 0;
  let totalMerged = 0;
  let totalSkipped = 0;

  for (const cat of PLAN) {
    console.log(`\n📚 Fetching: ${cat.key}`);

    // 1. Fetch from OpenLibrary
    const books = await OpenLibrary.safeFetch(cat.key, cat.limit);

    console.log(`→ Received ${books.length} books`);

    // 2. Insert into Mongo
    const result = await Inserter.insertBooks(books);

    totalAdded += result.added;
    totalMerged += result.merged;
    totalSkipped += result.skipped;

    console.log(
      `✔ Added:${result.added}  ` +
        `Merged:${result.merged}  ` +
        `Skipped:${result.skipped}`,
    );
  }

  console.log("\n===== FINAL REPORT =====");
  console.log("Added  :", totalAdded);
  console.log("Merged :", totalMerged);
  console.log("Skipped:", totalSkipped);

  await mongoose.disconnect();

  console.log("✅ Seeding Completed");
}

runSeed();
