const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const commentCtrl = require("../controllers/postComment_controller");

const { isMember, isBanned } = require("../middleware/club.middleware");

// Create comment
router.post(
  "/:clubId/posts/:postId/comments",
  auth,
  isMember,
  isBanned,
  commentCtrl.createComment,
);

// Get comments
router.get(
  "/:clubId/posts/:postId/comments",
  auth,
  isMember,
  commentCtrl.getComments,
);

// Delete comment
router.delete(
  "/:clubId/comments/:commentId",
  auth,
  isMember,
  commentCtrl.deleteComment,
);

module.exports = router;
