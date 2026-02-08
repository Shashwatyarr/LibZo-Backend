const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const postCtrl = require("../controllers/clubPost.controller");

const { isMember, isBanned } = require("../middleware/club.middleware");

// ============== CREATE POST ==============
router.post("/:clubId/posts", auth, isMember, isBanned, postCtrl.createPost);

// ============== GET CLUB FEED ==============
router.get("/:clubId/posts", auth, isMember, postCtrl.getPosts);

// ============== UPVOTE POST ==============
// 👉 ADD clubId in route
router.patch(
  "/:clubId/posts/:postId/upvote",
  auth,
  isMember,
  isBanned,
  postCtrl.upvotePost,
);

// ============== DELETE POST ==============
// 👉 ADD clubId
router.delete("/:clubId/posts/:postId", auth, isMember, postCtrl.deletePost);

module.exports = router;
