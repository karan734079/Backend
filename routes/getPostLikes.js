const Post = require("../models/post");

const getPostLikes = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user.id;

    if (post.likedBy.includes(userId)) {
      post.likes = Math.max(post.likes - 1, 0);
      post.likedBy = post.likedBy.filter((id) => id.toString() !== userId);
    } else {
      post.likes = Math.max(0, post.likes + 1);
      post.likedBy.push(userId);
    }

    await post.save();

    res.json({ message: "Post liked/unliked successfully", likes: post.likes });
  } catch (err) {
    console.error("Error liking/unliking post:", err.message);
    res.status(500).json({ message: "Error liking post", error: err.message });
  }
};

module.exports = getPostLikes;
