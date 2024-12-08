const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure uploads folder exists or set a path
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Set file name to avoid overwriting
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
