const cloudinary = require("cloudinary").v2;
const path = require("path");
const fs = require("fs");

// Configure Cloudinary
cloudinary.config({
    cloud_name: "dk3zxkgez",
    api_key: "654583881466299",
    api_secret: "_KR5paMPQ8cYAcDNtFwBK1zk6x4",
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