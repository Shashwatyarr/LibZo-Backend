const multer = require("multer");
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // --- SAFE LOG FOR DEBUG ---
  console.log("📁 UPLOADED FILE:", {
    name: file.originalname,
    mime: file.mimetype,
  });

  const allowed = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "image/heic",
    "image/heif",
  ];

  // 1️⃣ If valid mimetype → allow
  if (allowed.includes(file.mimetype)) {
    return cb(null, true);
  }

  // 2️⃣ Fallback: check extension
  const ext = file.originalname.toLowerCase();

  if (
    ext.endsWith(".jpg") ||
    ext.endsWith(".jpeg") ||
    ext.endsWith(".png") ||
    ext.endsWith(".webp")
  ) {
    return cb(null, true);
  }

  // 3️⃣ Last fallback – Telegram safe mode
  if (file.mimetype === "application/octet-stream") {
    return cb(null, true);
  }

  return cb(new Error("Only image files allowed"), false);
};

const uploadMemory = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
  },

  fileFilter,
});

module.exports = uploadMemory;
