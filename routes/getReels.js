const Post = require("../models/post");

const getReels = async (req, res) => {
  try {
    const videoPosts = await Post.find({ fileType: "video" })
      .populate("user", "username profilePhoto")
      .sort({ createdAt: -1 });

    res.json(videoPosts);
  } catch (err) {
    console.error("Error fetching reels:", err.message);
    res
      .status(500)
      .json({ message: "Error fetching reels", error: err.message });
  }
};

module.exports = getReels;
