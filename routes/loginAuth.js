const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { emitUserStatus } = require("./socketEvents");

const loginAuth = async (req, res) => { 
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.AUTH_SECRET_KEY, {
      expiresIn: "5h",
    });

    const isProfileComplete = user.name && user.address && user.profilePhoto;

    user.online = true;
    await user.save();
    emitUserStatus(user._id, "online");

    res.json({ message: "Login successful", token, isProfileComplete });
  } catch (err) {
    console.error("Error during login:", err.message);
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
};

module.exports = loginAuth;
