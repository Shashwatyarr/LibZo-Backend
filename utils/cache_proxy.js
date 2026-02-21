// const axios = require("axios");
// const { LRUCache } = require("lru-cache");

// const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// // ───── 1. LRU CACHE CONFIG ─────
// const cache = new LRUCache({
//   maxSize: 300 * 1024 * 1024, // 300MB
//   sizeCalculation: (v) => v.size,
//   max: 60,
//   ttl: 1000 * 60 * 60,
// });

// const inflight = new Map();

// function detectMime(buffer) {
//   if (!buffer || buffer.length < 4) return "image/jpeg";

//   if (buffer[0] === 0x89 && buffer[1] === 0x50) return "image/png";

//   if (buffer[0] === 0xff && buffer[1] === 0xd8) return "image/jpeg";

//   if (buffer.toString("ascii", 8, 12) === "WEBP") return "image/webp";

//   return "image/jpeg";
// }
// async function fetchFromTelegram(fileId) {
//   const pathRes = await axios.get(`${TG_API}/getFile?file_id=${fileId}`);

//   const filePath = pathRes.data.result.file_path;

//   const fileRes = await axios.get(
//     `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`,
//     { responseType: "arraybuffer" },
//   );

//   const buffer = Buffer.from(fileRes.data);

//   return {
//     buffer,
//     size: buffer.length,
//     mime: detectMime(buffer),
//   };
// }
// exports.getImageCached = async (fileId) => {
//   const cached = cache.get(fileId);
//   if (cached) {
//     return cached;
//   }

//   if (inflight.has(fileId)) {
//     return inflight.get(fileId);
//   }
//   const promise = fetchFromTelegram(fileId)
//     .then((data) => {
//       cache.set(fileId, data);
//       inflight.delete(fileId);
//       return data;
//     })
//     .catch((err) => {
//       inflight.delete(fileId);
//       throw err;
//     });

//   inflight.set(fileId, promise);

//   return promise;
// };
