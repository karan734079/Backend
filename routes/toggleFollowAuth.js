const User = require("../models/user");
const Notification = require("../models/notification")

const toggleFollowAuth = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;

    if (currentUserId === userId) {
      return res.status(400).json({ message: "You cannot follow/unfollow yourself" });
    }

    const currentUser = await User.findById(currentUserId);
    const userToFollow = await User.findById(userId);

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = currentUser.following.includes(userId);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter((id) => id.toString() !== userId);
      userToFollow.followers = userToFollow.followers.filter((id) => id.toString() !== currentUserId);
    } else {
      currentUser.following.push(userId);
      userToFollow.followers.push(currentUserId);

      // Create a follow notification for the user being followed
      const newNotification = new Notification({
        type: "follow",
        user: userId, // The user who is being followed
        fromUser: currentUserId, // The current user who is following
        isRead: false,
      });

      await newNotification.save();
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({ isFollowing: !isFollowing });
  } catch (err) {
    console.error("Error toggling follow:", err.message);
    res.status(500).json({ message: "Error toggling follow", error: err.message });
  }
};

module.exports = toggleFollowAuth;
