const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const path = require("path");
const { setSocketIoInstance , emitUserStatus} = require("./routes/socketEvents");

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
  .connect(process.env.MONGODBATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Error connecting to MongoDB", err));

app.use("/api/auth", authRoutes);

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("user-login", (userId) => {
    onlineUsers.set(userId, socket.id);
    emitUserStatus(userId, "online");
  });

  socket.on("user-logout", (userId) => {
    onlineUsers.delete(userId);
    emitUserStatus(userId, "offline");
  });

  socket.on("disconnect", () => {
    let userId = null;
    for (let [key, value] of onlineUsers.entries()) {
        if (value === socket.id) {
            userId = key;
            onlineUsers.delete(key); // Remove user from the online users map
            break;
        }
    }

    if (userId) {
        emitUserStatus(userId, "offline"); // Emit to clients that the user is offline
    }
});

});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
