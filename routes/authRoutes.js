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

    // Check if the user has already liked the post
    if (post.likedBy && post.likedBy.includes(req.user.id)) {
      return res.status(400).json({ message: "You have already liked this post" });
    }

    // Increment like count and add user to likedBy array
    post.likes += 1;
    post.likedBy.push(req.user.id);
    await post.save();

    res.json({ message: "Post liked successfully", likes: post.likes });
  } catch (err) {
    console.error("Error liking post:", err.message);
    res.status(500).json({ message: "Error liking post", error: err.message });
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
