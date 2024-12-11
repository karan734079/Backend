const User = require("../models/user");

const getUsersFromSearch = async (req, res) => {
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
};

module.exports = getUsersFromSearch;
