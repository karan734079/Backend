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
const notificationDelete = require("./notificationDelete");
const notificationRead = require("./notificationRead");
const notificationGet = require("./NotificationsGet");
const getFollowers = require("./getFollowers");
const getFollowing = require("./getFollowing");
const getReels = require("./getReels");
const getPosts = require("./getPosts");
const getPostLikes = require("./getPostLikes");
const postDelete = require("./postDelete");
const getUsersFromSearch = require("./getUsersFromSearch");

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
router.get("/getPosts", authenticate, getPosts);

//get Post Likes
router.put("/posts/:postId/like", authenticate, getPostLikes);

//delete post
router.delete("/posts/:postId", authenticate, postDelete);

//get reels
router.get("/reels", authenticate, getReels);

//get users from search
router.get("/users/search", authenticate,getUsersFromSearch);

//get followers
router.get("/followers", authenticate, getFollowers);

//get following
router.get("/following", authenticate, getFollowing);

router.get("/notifications", authenticate, notificationGet);

router.put("/notifications/:id/read", authenticate, notificationRead);

router.delete("/notifications/:id", authenticate, notificationDelete);

module.exports = router;
