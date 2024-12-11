const Notification = require("../models/notification");

const notificationRead =  async (req, res) => {
    try {
      const notification = await Notification.findById(req.params.id);
  
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
  
      notification.isRead = true;
      await notification.save();
  
      res.json({ message: "Notification marked as read" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error updating notification", error: err.message });
    }
};

module.exports = notificationRead;