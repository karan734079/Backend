const express = require("express");
const authenticate = require("../middleware/authenticate");
const signUpAuth = require("../routes/signUpAuth");
const loginAuth = require("../routes/loginAuth");
const upload = require("../middleware/multerConfig");
const updateProfileAuth = require("../routes/updateProfileAuth");
const getProfileAuth = require("../routes/getProfileAuth");
const getAllUserAuth = require("../routes/getAllUsersAuth");
const toggleFollowAuth = require("../routes/toggleFollowAuth");
const postsRoute = require("./postsRoute");
const Post = require("../models/post");
const User = require("../models/user");
const Notification = require("../models/notification")

const router = express.Router();

// Sign-Up Route
router.post("/sign-up", signUpAuth);

// Login Route
router.post("/login", loginAuth);

// update Profile
router.put(
  "/profile",
  authenticate,
  upload.single("profilePhoto"),
  updateProfileAuth
);

// get profile
router.get("/profile", authenticate, getProfileAuth);

//get all users
router.get("/users", authenticate, getAllUserAuth);

//get followAuth
router.post("/users/:userId/toggle-follow", authenticate, toggleFollowAuth);

//get posts
router.post("/posts", authenticate, upload.single("file"), postsRoute);

//get posts
router.get("/getPosts", authenticate, async (req, res) => {
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
});

router.put("/posts/:postId/like", authenticate, async (req, res) => {
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
});

//delete post
router.delete("/posts/:postId", authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own posts" });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err.message);
    res
      .status(500)
      .json({ message: "Error deleting post", error: err.message });
  }
});

router.get("/reels", authenticate, async (req, res) => {
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
});

router.get("/users/search", authenticate, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Perform partial match on usernames starting with the query
    const users = await User.find({
      username: { $regex: `^${query}`, $options: "i" }, // Case-insensitive search
    }).select("-password"); // Exclude sensitive fields like password

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.json(users);
  } catch (err) {
    console.error("Error searching users:", err.message);
    res
      .status(500)
      .json({ message: "Error searching users", error: err.message });
  }
});

//get followers
router.get("/followers", authenticate, async (req, res) => {
  const user = await User.findById(req.user.id).populate("followers");
  res.json(user.followers);
});

//get following
router.get("/following", authenticate, async (req, res) => {
  const user = await User.findById(req.user.id).populate("following");
  res.json(user.following);
});

router.get("/notifications", authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate("fromUser", "username profilePhoto")
      .populate("post")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching notifications", error: err.message });
  }
});

router.put("/notifications/:id/read", authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating notification", error: err.message });
  }
});

router.delete("/notifications/:id", authenticate, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting notification", error: err.message });
  }
});

module.exports = router;
