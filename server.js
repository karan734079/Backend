const dotenv = require('dotenv');
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const path = require("path");
dotenv.config();

const app = express();
const PORT = 5000;

//middleware
app.use(cors());
app.use(bodyParser.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//mongoDB connection
const MONGO_URI = process.env.MONGODBATLAS_URI;

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected Via compass"))
  .catch((err) => console.log("Error connecting to MongoDB", err));

//Routes
app.use("/api/auth", authRoutes);

//start server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
