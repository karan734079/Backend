const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const path = require("path");
const User = require("./models/user");
const {
  setSocketIoInstance,
  emitUserStatus,
} = require("./routes/socketEvents");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

setSocketIoInstance(io);

const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(process.env.MONGODBATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Error connecting to MongoDB", err));

app.use("/api/auth", authRoutes);

const onlineUsers = new Map();

io.on("connection", (socket) => {
  // console.log(`User connected: ${socket.id}`);

  socket.on("user-login", async (userId) => {
    onlineUsers.set(userId, socket.id);
    emitUserStatus(userId, "online");

    // Set the user status in the database
    await User.findByIdAndUpdate(userId, { online: true });
  });

  socket.on("user-logout", async (userId) => {
    onlineUsers.delete(userId);
    emitUserStatus(userId, "offline");

    // Set the user status in the database
    await User.findByIdAndUpdate(userId, { online: false });
  });

  socket.on("disconnect", async () => {
    let userId = null;

    for (let [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        userId = key;
        onlineUsers.delete(key); // Remove user from the online users map
        break;
      }
    }

    if (userId) {
      emitUserStatus(userId, "offline");

      // Set the user status in the database
      await User.findByIdAndUpdate(userId, { online: false });
    }
  });
});

server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
