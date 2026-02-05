const Book = require("../models/Book");

class SeedInserter {
  async insertBooks(books) {
    let added = 0;
    let merged = 0;
    let skipped = 0;

    for (const book of books) {
      const existing = await Book.findOne({
        openLibraryId: book.openLibraryId,
      });

      if (existing) {
        const newCats = [
          ...new Set([...existing.categories, ...book.categories]),
        ];

        if (newCats.length !== existing.categories.length) {
          existing.categories = newCats;
          await existing.save();
          merged++;
        } else {
          skipped++;
        }

        continue;
      }

      await Book.create(book);
      added++;
    }

    return { added, merged, skipped };
  }
}

module.exports = new SeedInserter();

// const Book = require("../models/Book");

// class SeedInserter {
//   // ----- MAIN FUNCTION -----
//   async insertBooks(books) {
//     let added = 0;
//     let skipped = 0;
//     let merged = 0;

//     for (const book of books) {
//       try {
//         // 1. Check existing
//         const existing = await Book.findOne({
//           openLibraryId: book.openLibraryId,
//         });

//         // ----- IF ALREADY EXISTS -----
//         if (existing) {
//           // Merge categories
//           const newCats = this._mergeCategories(
//             existing.categories,
//             book.categories,
//           );

//           if (newCats.length !== existing.categories.length) {
//             existing.categories = newCats;
//             await existing.save();
//             merged++;
//           } else {
//             skipped++;
//           }

//           continue;
//         }

//         // ----- NEW BOOK -----
//         await Book.create(book);
//         added++;
//       } catch (error) {
//         console.log(`Error inserting ${book.title}:`, error.message);
//       }
//     }

//     return { added, skipped, merged };
//   }

//   // ----- CATEGORY MERGE LOGIC -----
//   _mergeCategories(oldCats = [], newCats = []) {
//     const set = new Set([...oldCats, ...newCats]);

//     return Array.from(set);
//   }
// }

// module.exports = new SeedInserter();
