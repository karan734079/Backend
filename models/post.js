const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    user: { type: String },
    mediaUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
