const User = require("../models/user");


const getProfileAuth = async (req, res) => {
    try {
        const userId = req.query.userId || req.user.id;
        const user = await User.findById(userId, "-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (err) {
        console.error("Error fetching profile:", err.message);
        res.status(500).json({ message: "Error fetching profile", error: err.message });
    }
};

module.exports = getProfileAuth;

