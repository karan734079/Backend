const User = require("../models/user");

const getFollowing = async (req, res) => {
  const user = await User.findById(req.user.id).populate("following");
  res.json(user.following);
};

module.exports = getFollowing;
