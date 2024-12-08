const cloudinary = require("cloudinary").v2;
const path = require("path");
const fs = require("fs");

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDNARY_API_SECRET_KEY,
});

const uploadImageToCloudinary = async (filePath, resourceType = "image") => {
    const result = await cloudinary.uploader.upload(
      path.normalize(filePath),
      { folder: "profile_photos", resource_type: resourceType } // Handle both image and video uploads
    );
    fs.unlinkSync(filePath);
    return result;
  };
  
  module.exports = uploadImageToCloudinary;
  

module.exports = uploadImageToCloudinary; 