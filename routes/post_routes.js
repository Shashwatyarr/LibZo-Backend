const express = require("express");
const router = express.Router();
const postController = require("../controllers/post_controller");
const auth = require("../middleware/auth");
const { toggleLike } = require("../controllers/post_controller");

router.post("/create", auth, postController.createPost);
router.get("/feed", postController.getPosts);
router.post("/like/:postId", auth, toggleLike);
module.exports = router;
