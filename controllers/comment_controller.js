const Comment = require("../models/comment");
const Post = require("../models/posts");
exports.createPost = async (req, res) => {
  try {
    const { postId, text } = req.body;
    const userId = req.user.id;

    const newPost = new Comment({
      text,
      postId,
      userId,
    });
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    await newPost.save();
    console.log(newPost);
    res.status(201).json({
      success: true,
      message: "Comment added successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const postId = req.params.postId;

    const comments = await Comment.find({ postId })
      .populate("userId", "name profileImage")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
