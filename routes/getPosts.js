const Post = require("../models/post");

const getPosts = async (req, res) => {
  try {
    const { filter } = req.query;
    let query = {};

    if (filter === "currentUser") {
      query = { user: req.user.id };
    } else if (filter === "others") {
      query = { user: { $ne: req.user.id } };
    } else if (filter === "userId") {
      query = { user: req.query.userId };
    }

    const posts = await Post.find(query)
      .populate("user", "username profilePhoto")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err.message);
    res.status(500).json({ message: "Error fetching posts" });
  }
};

module.exports = getPosts;
