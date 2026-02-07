const Post = require("../models/posts");
const { uploadImageToTelegram } = require("../utils/telegram_media");
const mongoose = require("mongoose");

// ───── CREATE POST ─────
exports.createPost = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;

    // 1. Text validation
    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Post text is required",
      });
    }

    let images = [];

    // 2. Image handling
    if (req.files && req.files.length > 0) {
      // max 4 rule
      if (req.files.length > 4) {
        return res.status(400).json({
          success: false,
          message: "Max 4 images allowed",
        });
      }

      // ───── ATOMIC UPLOAD GUARD ─────
      try {
        for (const file of req.files) {
          const tgResult = await uploadImageToTelegram(file);

          images.push({
            file_id: tgResult.file_id,
            width: tgResult.width,
            height: tgResult.height,
            size: tgResult.size,
          });
        }
      } catch (uploadErr) {
        // Agar ek bhi image fail → post nahi banega
        return res.status(502).json({
          success: false,
          message: "Image upload failed, please retry",
        });
      }
    }

    // 3. Create Post
    const newPost = new Post({
      userId,
      text,
      images,
    });

    await newPost.save();

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: newPost,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};

// ───── GET POSTS ─────
exports.getPosts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 5;

    const posts = await Post.find()

      .populate("userId", "username fullName profilePicture")

      .sort({ createdAt: -1 })

      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      page,
      count: posts.length,
      posts,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};

// ───── TOGGLE LIKE ─────
exports.toggleLike = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userObjectId);
    }

    await post.save();

    res.json({
      success: true,
      likes: post.likes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post id",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own posts",
      });
    }

    await Post.findByIdAndDelete(postId);

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
