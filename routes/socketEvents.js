let io;
const onlineUsers = new Map();

const setSocketIoInstance = (socketIoInstance) => {
  io = socketIoInstance;
};

const emitUserStatus = (userId, status) => {
  if (io) {
      io.emit("user-status", { userId, status });
  } else {
      console.log("Socket.IO instance not available");
  }
};


module.exports = { setSocketIoInstance, emitUserStatus };
