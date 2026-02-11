const ClubPost = require("../models/CommunityModel/ClubPostSchema");
const ClubSchema = require("../models/CommunityModel/ClubSchema");
const Club = require("../models/CommunityModel/ClubSchema");
const { uploadImageToTelegram } = require("../utils/telegram_media");
// ============== CREATE POST ==============
// Middleware: isMember + notBanned

exports.createPost = async (req, res) => {
  try {
    const { clubId } = req.params;

    console.log("📥 CREATE POST HIT");
    console.log("body:", req.body);
    console.log("files:", req.files);

    let imageFileId = "";

    // ───── IMAGE UPLOAD TO TELEGRAM ─────
    if (req.files && req.files.length > 0) {
      const file = req.files[0];

      const tg = await uploadImageToTelegram(file);

      imageFileId = tg.file_id;
    }

    const post = await ClubPost.create({
      clubId: clubId,
      userID: req.user.id,

      type: req.body.type || "text",

      content: req.body.content,

      image: imageFileId, // 🔥 REAL FILE ID
    });

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
// Middleware: isMember

exports.getPosts = async (req, res) => {
  try {
    const { clubId } = req.params;

    const posts = await ClubPost.find({ clubId })
      .populate("userID", "fullName username profile.profileImage")
      .sort({
        "stats.upvotes": -1,
        "stats.downvotes": 1,
        createdAt: -1,
      });

    res.json({
      success: true,
      posts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============== UPVOTE POST ==============
// Middleware: isMember + notBanned

exports.upvotePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await ClubPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const alreadyUpvoted = post.upvotedBy.includes(userId);
    const alreadyDownvoted = post.downvotedBy.includes(userId);

    let updated;

    // ───── CASE 1: ALREADY UPVOTED → REMOVE ─────
    if (alreadyUpvoted) {
      updated = await ClubPost.findByIdAndUpdate(
        postId,
        {
          $inc: { "stats.upvotes": -1 },
          $pull: { upvotedBy: userId },
        },
        { new: true },
      );
    }

    // ───── CASE 2: WAS DOWNVOTED → SHIFT TO UPVOTE ─────
    else if (alreadyDownvoted) {
      updated = await ClubPost.findByIdAndUpdate(
        postId,
        {
          $inc: {
            "stats.downvotes": -1,
            "stats.upvotes": 1,
          },
          $pull: { downvotedBy: userId },
          $addToSet: { upvotedBy: userId },
        },
        { new: true },
      );
    }

    // ───── CASE 3: NORMAL UPVOTE ─────
    else {
      updated = await ClubPost.findByIdAndUpdate(
        postId,
        {
          $inc: { "stats.upvotes": 1 },
          $addToSet: { upvotedBy: userId },
        },
        { new: true },
      );
    }

    res.json({
      success: true,
      post: updated,
      upvoted: !alreadyUpvoted,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.downvotePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await ClubPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const alreadyDownvoted = post.downvotedBy.includes(userId);
    const alreadyUpvoted = post.upvotedBy.includes(userId);

    let updated;

    // ───── CASE 1: ALREADY DOWNVOTED → REMOVE ─────
    if (alreadyDownvoted) {
      updated = await ClubPost.findByIdAndUpdate(
        postId,
        {
          $inc: { "stats.downvotes": -1 }, // ✅ FIXED
          $pull: { downvotedBy: userId },
        },
        { new: true },
      );
    }

    // ───── CASE 2: WAS UPVOTED → SHIFT TO DOWNVOTE ─────
    else if (alreadyUpvoted) {
      updated = await ClubPost.findByIdAndUpdate(
        postId,
        {
          $inc: {
            "stats.upvotes": -1,
            "stats.downvotes": 1,
          },
          $pull: { upvotedBy: userId },
          $addToSet: { downvotedBy: userId },
        },
        { new: true },
      );
    }

    // ───── CASE 3: NORMAL NEW DOWNVOTE ─────
    else {
      updated = await ClubPost.findByIdAndUpdate(
        postId,
        {
          $inc: { "stats.downvotes": 1 },
          $addToSet: { downvotedBy: userId },
        },
        { new: true },
      );
    }

    res.json({
      success: true,
      post: updated,
      downvoted: !alreadyDownvoted,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============== DELETE POST ==============
// Middleware: isMember

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await ClubPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // ✅ Ownership + Role Check
    const isOwner = post.userID.toString() === req.user.id;

    const isStaff =
      req.member && ["admin", "moderator"].includes(req.member.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        message: "Not allowed to delete this post",
      });
    }

    await post.deleteOne();

    // decrease count
    await Club.findByIdAndUpdate(post.clubId, {
      $inc: { "stats.post": -1 },
    });

    res.json({
      success: true,
      message: "Post deleted",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
