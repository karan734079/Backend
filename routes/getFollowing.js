const User = require("../models/user");

const getFollowing = async (req, res) => {
  try {
    // Find the current user and populate the "following" field
    const user = await User.findById(req.user.id).populate("following");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Map through the following list and include additional user details
    const followingWithStatus = user.following.map((followedUser) => ({
      _id: followedUser._id,
      name: followedUser.name,
      profilePhoto: followedUser.profilePhoto,
      online: followedUser.online, // Include the online status
    }));

    res.json(followingWithStatus);
  } catch (error) {
    console.error("Error fetching following list:", error.message);
    res.status(500).json({ message: "Error fetching following list" });
  }
};

module.exports = getFollowing;

