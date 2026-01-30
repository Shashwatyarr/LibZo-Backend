const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment_controller");
const auth = require("../middleware/auth");

router.post("/add", auth, commentController.createPost);
router.get("/:postId", auth, commentController.getComments);

module.exports = router;
