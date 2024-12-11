const Notification = require('../models/notification');

const notificationGet = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate("fromUser", "username profilePhoto")
      .populate("post")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching notifications", error: err.message });
  }
};

module.exports = notificationGet;