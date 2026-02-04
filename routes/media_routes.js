const express = require("express");
const { getImageCached } = require("../utils/cache_proxy");

const router = express.Router();

// ───── Simple in-memory rate guard ─────
const hits = new Map();

function rateGuard(req, res, next) {
  const ip = req.ip;

  const now = Date.now();
  const windowMs = 60 * 1000; // 1 min
  const max = 30; // 30 req/min

  if (!hits.has(ip)) {
    hits.set(ip, []);
  }

  const arr = hits.get(ip).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);

  if (arr.length > max) {
    return res.status(429).json({
      message: "Too many image requests",
    });
  }

  next();
}

// ───── FileId basic validation ─────
function validateId(req, res, next) {
  const { fileId } = req.params;

  if (!fileId || fileId.length < 10) {
    return res.status(400).json({
      message: "Invalid file id",
    });
  }

  next();
}

// ───── ROUTE ─────
router.get("/:fileId", rateGuard, validateId, async (req, res) => {
  try {
    const img = await getImageCached(req.params.fileId);

    res.set("Content-Type", img.mime);
    res.send(img.buffer);
  } catch (err) {
    // Telegram invalid id
    if (err.response?.status === 400) {
      return res.status(404).json({
        message: "Image not found",
      });
    }

    res.status(502).json({
      message: "Failed to load image",
    });
  }
});

module.exports = router;
