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
const User = require("../models/user")

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
    const { filter } = req.query; // 'currentUser' or 'others'
    let query = {};

    if (filter === "currentUser") {
      query = { user: req.user.id };
    } else if (filter === "others") {
      query = { user: { $ne: req.user.id } };
    }else if (filter === "userId") {
      query = { user: req.query.userId }; // Add this case
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

    // If the user has already liked the post, we remove the like
    if (post.likedBy.includes(userId)) {
      post.likes = Math.max(post.likes - 1, 0);  // Ensure likes can't be negative
      post.likedBy = post.likedBy.filter(id => id.toString() !== userId);
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


// Add this route to the posts route file

router.delete("/posts/:postId", authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the logged-in user is the owner of the post
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    // Delete the post
    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err.message);
    res.status(500).json({ message: "Error deleting post", error: err.message });
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
    res.status(500).json({ message: "Error fetching reels", error: err.message });
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

module.exports = router;