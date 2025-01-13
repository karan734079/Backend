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
const { log } = require("console");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Initialize socket.io instance
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
  .catch((err) => console.log("Error connecting to MongoDB:", err));

app.use("/api/auth", authRoutes);

const onlineUsers = new Map(); // Map to track online users and their socket IDs

io.use((socket, next) => {
  console.log("Socket Event Names:", socket.id);
  next();
});

// Function to get the recipient's socket ID(s) from online users
const getRecipientSocketIds = (userId) => {
  const recipientSockets = onlineUsers.get(userId);
  return recipientSockets && recipientSockets.length > 0 ? recipientSockets : null;
};


io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user login and store their socket ID
  socket.on("user-login", async (userId) => {
    try {
      console.log(`User logged in: ${userId}, socket.id: ${socket.id}`);
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, []);
      }
      onlineUsers.get(userId).push(socket.id);

      emitUserStatus(userId, "online");
      console.log("User is now online:", {
        userId,
        socketIds: onlineUsers.get(userId),
      });

      // Update the user's online status in the database
      await User.findByIdAndUpdate(userId, { online: true }).catch(
        console.error
      );
    } catch (err) {
      console.error("Error during user-login:", err);
    }
  });

  // Handle user logout and remove their socket ID
  socket.on("user-logout", async (userId) => {
    try {
      console.log(`User logged out: ${userId}`);
      onlineUsers.delete(userId);
      emitUserStatus(userId, "offline");

      // Update the user's online status in the database
      await User.findByIdAndUpdate(userId, { online: false }).catch(
        console.error
      );
    } catch (err) {
      console.error("Error during user-logout:", err);
    }
  });

  socket.on("start-call", ({ from, to, callerName , callerSocketId}) => {
    // Fetch the recipient's socket ID
    const recipientSocketId = getRecipientSocketIds(to);
    console.log("recipent socket id = ",recipientSocketId)

    if (recipientSocketId) {
      // Recipient is online, emit 'incoming-call'
      console.log(
        `Emitting 'incoming-call' to recipient (${to}) at socket ID: ${recipientSocketId}`
      );
      io.to(recipientSocketId.pop()).emit("incoming-call", {
        from,
        callerSocketId,
        callerName,
      })

      console.log(from);
      console.log(callerSocketId);
      console.log(callerName);
    } else {
      // Recipient is offline
      console.error(`Recipient (${to}) is offline or not connected.`);
      socket.emit("call-status", { status: "User is offline." });
    }
  });

  socket.on("accept-call", ({ callerSocketId }) => {
    if (callerSocketId) {
      console.log(
        `Call accepted by recipient. Notifying caller (${callerSocketId})...`
      );
      io.to(callerSocketId).emit("call-accepted");
    }
  });

  socket.on("decline-call", ({ callerSocketId }) => {
    if (callerSocketId) {
      console.log(
        `Call declined by recipient. Notifying caller (${callerSocketId})...`
      );
      io.to(callerSocketId).emit("call-declined");
    }
  });

  // Handle ICE candidate sharing
  socket.on("ice-candidate", ({ candidate, to }) => {
    const recipientSockets = onlineUsers.get(to) || [];
    recipientSockets.forEach((recipientSocketId) => {
      console.log(`Sending ICE candidate to: ${recipientSocketId}`);
      io.to(recipientSocketId).emit("ice-candidate", { candidate });
    });
  });

  // Handle WebRTC offer
  socket.on("offer", ({ sdp, to }) => {
    const recipientSockets = onlineUsers.get(to) || [];
    recipientSockets.forEach((recipientSocketId) => {
      console.log(`Sending WebRTC offer to: ${recipientSocketId}`);
      io.to(recipientSocketId).emit("offer", { sdp });
    });
  });

  // Handle WebRTC answer
  socket.on("answer", ({ sdp, to }) => {
    const recipientSockets = onlineUsers.get(to) || [];
    recipientSockets.forEach((recipientSocketId) => {
      console.log(`Sending WebRTC answer to: ${recipientSocketId}`);
      io.to(recipientSocketId).emit("answer", { sdp });
    });
  });

  // Handle socket disconnection
  socket.on("disconnect", async () => {
    let userId = null;

    // Find the user associated with this socket ID
    for (let [key, value] of onlineUsers.entries()) {
      const index = value.indexOf(socket.id);
      if (index !== -1) {
        value.splice(index, 1); // Remove the socket ID
        if (value.length === 0) {
          onlineUsers.delete(key); // Remove user if no sockets remain
        }
        userId = key;
        break;
      }
    }

    if (userId) {
      console.log(`User disconnected: ${userId}`);
      emitUserStatus(userId, "offline");

      // Update the user's online status in the database
      await User.findByIdAndUpdate(userId, { online: false }).catch(
        console.error
      );
    }
  });
});

server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
