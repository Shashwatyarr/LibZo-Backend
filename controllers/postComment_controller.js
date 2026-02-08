const PostComment = require("../models/CommunityModel/Comment");
const ClubPost = require("../models/CommunityModel/ClubPostSchema");

// ============== CREATE COMMENT ==============
// Protected by: isMember + notBanned

exports.createComment = async (req, res) => {
  try {
    const { postId } = req.params;

    const comment = await PostComment.create({
      postId: postId,
      userId: req.user.id,
      text: req.body.text,
    });

    // increase comment count
    await ClubPost.findByIdAndUpdate(postId, {
      $inc: { "stats.comments": 1 },
    });

    res.status(201).json({
      success: true,
      comment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============== GET COMMENTS ==============
// Protected by: isMember

exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await PostComment.find({ postId })
      .populate("userId", "fullName username profile.profileImage")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============== DELETE COMMENT ==============
// Protected by: isMember

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await PostComment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // Ownership or admin/mod check
    if (
      comment.userId.toString() !== req.user.id &&
      !["admin", "moderator"].includes(req.member.role)
    ) {
      return res.status(403).json({
        message: "Not allowed to delete",
      });
    }

    await comment.deleteOne();

    // decrease count
    await ClubPost.findByIdAndUpdate(comment.postId, {
      $inc: { "stats.comments": -1 },
    });

    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
