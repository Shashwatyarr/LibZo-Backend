const Post = require("../models/posts");

exports.createPost = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Post text is required",
      });
    }
    let images = "";
    if (req.file) {
      images = `/uploads/posts/${req.file.filename}`;
    }

    const newPost = new Post({
      userId,
      text,
      image: images,
    });

    await newPost.save();
    console.log(newPost);
    res.status(201).json({
      success: true,
      message: "Post created successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate(
        "userId",
        "username fullName profilePicture createdAt likes commentCount image",
      )
      .sort({ createdAt: -1 });
    console.log(posts[0].likes);

    res.json(posts);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};

const mongoose = require("mongoose");

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

    console.log("Saved likes:", post.likes);

    res.json({
      success: true,
      likes: post.likes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
