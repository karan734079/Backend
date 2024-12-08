const User = require("../models/user");
const uploadImageToCloudinary = require("../utils/cloudnary")

const updateProfileAuth = async (req, res) => {
  try {
    console.log('Request Body:', req.body);  // Logs the form data sent from frontend
    console.log('Uploaded File:', req.file);  // Logs the uploaded file info

    const { name, address } = req.body;

    if (!name || !address) {
      return res.status(400).json({ message: "Name and address are required" });
    }

    let profilePhotoUrl = null;

    if (req.file) {
      try {
        const uploadResult = await uploadImageToCloudinary(req.file.path);
        profilePhotoUrl = uploadResult.secure_url;
      } catch (err) {
        console.error("Cloudinary Upload Error:", err.message);
        return res.status(500).json({ message: "Error uploading image", error: err.message });
      }
    }

    // Make sure the file is being processed here
    console.log('Profile photo URL:', profilePhotoUrl);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        address,
        ...(profilePhotoUrl && { profilePhoto: profilePhotoUrl }),
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile Updated Successfully", user: updatedUser });
  } catch (err) {
    console.error("Error updating profile:", err.message);
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};

module.exports = updateProfileAuth;
