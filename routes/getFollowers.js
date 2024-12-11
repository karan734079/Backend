const User = require("../models/user");

const getFollowers = async (req, res) => {
  const user = await User.findById(req.user.id).populate("followers");
  res.json(user.followers);
};

module.exports = getFollowers;
