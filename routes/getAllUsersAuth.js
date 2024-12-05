const User = require("../models/user");

const getAllUserAuth = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Fetch all users except the currently logged-in user
    const users = await User.find({ _id: { $ne: currentUserId } }, "-password");

    res.json(users);
  } catch (err) {
    console.error("error fetchinh users", err);
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
};

module.exports = getAllUserAuth;