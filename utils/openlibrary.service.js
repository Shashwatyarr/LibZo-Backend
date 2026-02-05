const axios = require("axios");

async function delay(ms) {
  return await new Promise((res) => setTimeout(res, ms));
}

class OpenLibraryService {
  // ===== SEARCH FROM OPENLIBRARY =====
  async searchByText(text) {
    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(text)}&limit=20`;

      const res = await axios.get(url);

      const docs = res.data.docs || [];

      const books = docs
        .map((d) => this._normalizeSearchDoc(d))
        .filter((b) => b !== null);

      return books;
    } catch (e) {
      return [];
    }
  }

  // ===== STRICT NORMALIZER =====
  _normalizeSearchDoc(d) {
    if (!d.title) return null;
    if (!d.key) return null;

    const authors = d.author_name || [];
    if (authors.length === 0) return null;

    const langs = d.language || [];
    if (langs.length > 0 && !langs.includes("eng")) {
      return null;
    }

    const openLibraryId = d.key.includes("/works/")
      ? d.key.replace("/works/", "")
      : d.key;

    return {
      openLibraryId,

      title: d.title.trim(),

      authors: authors.map((name) => ({
        name: name.trim(),
      })),

      isbn: d.isbn || [],

      coverUrl: d.cover_i
        ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`
        : null,

      publishYear: d.first_publish_year || null,

      categories: this._guessCategory(d.subject || []),

      popularityScore: 0,

      source: "openlibrary",
    };
  }

  _guessCategory(subjects = []) {
    const text = subjects.join(" ").toLowerCase();

    if (text.includes("business")) return ["Business & Finance"];
    if (text.includes("self")) return ["Self Help"];
    if (text.includes("fiction")) return ["Fiction"];
    if (text.includes("program")) return ["Programming & Tech"];
    if (text.includes("romance")) return ["Romance"];

    return ["Fiction"]; // default safe
  }
}

module.exports = new OpenLibraryService();

// const axios = require("axios");

// // async delay helper (without explicit Promise usage in logic)
// async function delay(ms) {
//   return await new Promise((resolve) => setTimeout(resolve, ms));
// }

// class OpenLibraryService {
//   // ----- 1. Fetch books by category -----
//   async fetchByCategory(category, limit = 250) {
//     const url = `https://openlibrary.org/subjects/${category}.json?limit=${limit}`;

//     try {
//       const res = await axios.get(url);

//       const works = res.data.works || [];

//       const books = works
//         .map((work) => this._normalizeSubjectWork(work, category))
//         .filter((book) => book !== null);

//       return books;
//     } catch (error) {
//       console.error(`Error fetching category ${category}: ${error.message}`);
//       return [];
//     }
//   }

//   // ----- 2. Normalize raw OpenLibrary work -----
//   _normalizeSubjectWork(work, category) {
//     // ----- Basic validations -----
//     if (!work.title) return null;
//     if (!work.key) return null;
//     if (!work.authors || work.authors.length === 0) return null;

//     // ----- English filter -----
//     const languages = work.language || [];
//     if (languages.length > 0 && !languages.includes("eng")) {
//       return null;
//     }

//     const openLibraryId = work.key.replace("/works/", "");

//     return {
//       openLibraryId,

//       title: work.title,

//       authors: work.authors.map((a) => ({
//         name: a.name,
//         openLibraryAuthorId: a.key ? a.key.replace("/authors/", "") : null,
//       })),

//       coverUrl: work.cover_id
//         ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg`
//         : null,

//       categories: [this._mapCategory(category)],

//       publishYear: work.first_publish_year || null,

//       popularityScore: 0,
//       source: "seeded",
//     };
//   }

//   // ----- 3. Category mapper -----
//   _mapCategory(raw) {
//     const map = {
//       self_help: "Self Help",
//       fiction: "Fiction",
//       business: "Business & Finance",
//       romance: "Romance",
//       biography: "Biography & Memoir",
//       programming: "Programming & Tech",
//       psychology: "Psychology",
//       science: "Science",
//       history: "History",
//       philosophy: "Philosophy",
//       health: "Health & Fitness",
//       children: "Children",
//       education: "Education & Exams",
//       poetry: "Poetry",
//     };

//     return map[raw] || raw;
//   }

//   // ----- 4. Safe fetch with retry (async/await only) -----
//   async safeFetch(category, limit) {
//     let attempts = 0;

//     while (attempts < 3) {
//       try {
//         const data = await this.fetchByCategory(category, limit);

//         await delay(1200); // rate-limit safety

//         return data;
//       } catch (error) {
//         attempts++;

//         console.log(`Retry ${attempts} for ${category}`);

//         await delay(2000);
//       }
//     }

//     return [];
//   }
// }

// module.exports = new OpenLibraryService();
