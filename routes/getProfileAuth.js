const User = require("../models/user");


// Get Profile Route
const getProfileAuth = async (req, res) => {
    try {
        const user = await User.findById(req.user.id, "-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (err) {
        console.error("Error fetching profile:", err.message);
        res.status(500).json({ message: "Error fetching profile", error: err.message });
    }
};

module.exports = getProfileAuth;
