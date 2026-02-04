const express = require("express");
const router = express.Router();
const postController = require("../controllers/post_controller");
const auth = require("../middleware/auth");
const { toggleLike } = require("../controllers/post_controller");
const upload = require("../middleware/upload_memory");

router.post(
  "/create",
  auth,
  upload.array("images", 4),
  postController.createPost,
);
router.get("/feed", postController.getPosts);
router.post("/like/:postId", auth, toggleLike);

module.exports = router;
