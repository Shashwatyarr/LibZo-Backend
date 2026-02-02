const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 🔥 Dynamic destination based on route
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/profile";

    // Agar request posts route se aa rahi
    if (req.baseUrl.includes("posts")) {
      folder = "uploads/posts";
    }

    // Ensure folder exists
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const prefix = req.baseUrl.includes("posts") ? "post" : "user";

    cb(
      null,
      `${prefix}-${req.user.id}-${Date.now()}${path.extname(
        file.originalname,
      )}`,
    );
  },
});

// 🔐 SMART FILE FILTER
const fileFilter = (req, file, cb) => {
  console.log("MIME:", file.mimetype);
  console.log("NAME:", file.originalname);

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "image/heic",
  ];

  const ext = path.extname(file.originalname).toLowerCase();

  if (
    allowedTypes.includes(file.mimetype) ||
    [".jpg", ".jpeg", ".png", ".webp", ".heic"].includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
