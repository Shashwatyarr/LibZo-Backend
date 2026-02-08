const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload_memory");

const {
  getProfile,
  updateProfile,
  getProfileCompleteness,
  getUserLibrary,
  uploadProfilePhoto,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserPosts,
  getUserProfile,
} = require("../controllers/profile_controller");

const authMiddleware = require("../middleware/auth");

//router.get("/", authMiddleware, getProfile);

router.put("/update", authMiddleware, updateProfile);

router.get("/completion", authMiddleware, getProfileCompleteness);

router.get("/library", authMiddleware, getUserLibrary);

router.post("/follow/:userId", authMiddleware, followUser);

router.post("/unfollow/:userId", authMiddleware, unfollowUser);

router.get("/followers/:userId", getFollowers);

router.get("/following/:userId", getFollowing);

router.post(
  "/upload-photo",
  authMiddleware,
  upload.single("profileImage"),
  uploadProfilePhoto,
);
// ✅ PEHLE specific
router.get("/posts/:id", authMiddleware, getUserPosts);

// ✅ LAST me generic
router.get("/:id", authMiddleware, getUserProfile);

module.exports = router;
