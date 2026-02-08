const ClubPost = require("../models/CommunityModel/ClubPostSchema");
const Club = require("../models/CommunityModel/ClubSchema");

// ============== CREATE POST ==============
// Protected by: isMember + notBanned

exports.createPost = async (req, res) => {
  try {
    const { clubId } = req.params;

    const post = await ClubPost.create({
      clubId: clubId,
      userId: req.user.id,
      type: req.body.type || "text",
      content: req.body.content,
      image: req.body.image || "",
    });

    // increase club post count
    await Club.findByIdAndUpdate(clubId, {
      $inc: { "stats.post": 1 },
    });

    res.status(201).json({
      success: true,
      post,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============== GET CLUB FEED ==============
// Protected by: isMember

exports.getPosts = async (req, res) => {
  try {
    const { clubId } = req.params;

    const posts = await ClubPost.find({ clubId })
      .populate("userId", "fullName username profile.profileImage")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============== UPVOTE POST ==============
// Protected by: isMember + notBanned

exports.upvotePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await ClubPost.findByIdAndUpdate(
      postId,
      { $inc: { "stats.upvotes": 1 } },
      { new: true },
    );

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============== DELETE POST ==============
// Middleware must check role or ownership

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await ClubPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // ownership check
    if (
      post.userId.toString() !== req.user.id &&
      !["admin", "moderator"].includes(req.member.role)
    ) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    await post.deleteOne();

    // decrease count
    await Club.findByIdAndUpdate(post.clubId, {
      $inc: { "stats.post": -1 },
    });

    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
