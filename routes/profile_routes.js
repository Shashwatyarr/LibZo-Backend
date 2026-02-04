const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload_memory");
const {
  getProfile,
  updateProfile,
  getProfileCompleteness,
  getUserLibrary,
  uploadProfilePhoto,
} = require("../controllers/profile_controller");

const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, getProfile);
router.put("/update", authMiddleware, updateProfile);
router.get("/completion", authMiddleware, getProfileCompleteness);
router.get("/library", authMiddleware, getUserLibrary);

router.post(
  "/upload-photo",
  authMiddleware,
  upload.single("profileImage"),
  uploadProfilePhoto,
);

module.exports = router;
