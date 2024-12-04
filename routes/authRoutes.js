const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Correct import
const authenticate = require("../middleware/authenticate");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


const router = express.Router();

const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: "your_name",
    api_key: "Your_api_key",
    api_secret: "your_secret_key"
});

const uploadImageToCloudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(path.normalize(filePath), { folder: "profile_photos" });
  fs.unlinkSync(filePath);
  return result;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Sign-Up Route
router.post("/sign-up", async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(409).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
      const user = await User.findOne({ username });
      if (!user) return res.status(404).json({ message: "User not found" });

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
          return res.status(401).json({ message: "Invalid password" });
      }

      const token = jwt.sign({ id: user._id }, process.env.AUTH_SECRET_KEY, { expiresIn: "1h" });
      const isProfileComplete = user.name && user.address && user.profilePhoto;

      res.json({ message: "Login successful", token, isProfileComplete });
  } catch (err) {
      console.error("Error during login:", err.message);
      res.status(500).json({ message: "Error logging in", error: err.message });
  }
});
const upload = multer({storage});

// update Profile
router.put(
  "/profile",
  authenticate,
  upload.single("profilePhoto"),
  async (req, res) => {
      try {
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
  }
);

// get profile
router.get("/profile",authenticate , async (req,res) =>{
  try {
    const user = await User.findById(req.user.id,"-password");
    if(!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  }catch (err){
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
})

module.exports = router;
