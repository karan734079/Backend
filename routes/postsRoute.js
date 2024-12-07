const uploadImageToCloudinary = require("../utils/cloudnary");
const Post = require("../models/post");
const User = require("../models/user")

const postsRoute = async (req, res) => {
  try {
    const result = await uploadImageToCloudinary(req.file.path);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPost = new Post({
      user: req.user.id,
      username: user.username,
      profilePhoto: user.profilePhoto,
      mediaUrl: result.secure_url,
    });

    await newPost.save();

    const populatedPost = await Post.findById(newPost._id).populate(
      "user",
      "username profilePhoto"
    );

    res.json({ message: "Post created successfully", post: populatedPost });
  } catch (err) {
    console.error("Error creating post:", err.message);
    res.status(500).json({ message: "Error creating post", error: err.message });
  }
};

module.exports = postsRoute;
