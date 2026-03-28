// import { Server } from "socket.io";
// import http from "http";
// import express from "express";

// const app = express();

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*", // ✅ RN + Web dono ke liye
//     methods: ["GET", "POST"],
//   },
// });

// const userSocketMap = {}; // { userId: socketId }

// export const getReceiverSocketId = (receiverId) => {
//   return userSocketMap[receiverId];
// };

// io.on("connection", (socket) => {
//   // ✅ RN & Web compatible
//   const userId =
//     socket.handshake.auth?.userId ||
//     socket.handshake.query?.userId;

//   console.log("🔗 Socket connected, userId:", userId);

//   if (userId) {
//     userSocketMap[userId] = socket.id;
//   }

//   // 🔥 send online users
//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   socket.on("disconnect", () => {
//     if (userId) {
//       delete userSocketMap[userId];
//     }
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//     console.log("❌ Socket disconnected:", userId);
//   });
// });

// export { app, io, server };




import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// { userId: Set(socketId) }
const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
  const sockets = userSocketMap[receiverId];
  if (!sockets) return null;
  return Array.from(sockets); // multiple socketIds
};

io.on("connection", (socket) => {
  const userId =
    socket.handshake.auth?.userId ||
    socket.handshake.query?.userId;

     if (userId) {
    socket.join(userId);
  }
  console.log("🔗 Socket connected, userId:", userId);

  if (!userId) return;

  if (!userSocketMap[userId]) {
    userSocketMap[userId] = new Set();
  }

  userSocketMap[userId].add(socket.id);

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    userSocketMap[userId].delete(socket.id);

    if (userSocketMap[userId].size === 0) {
      delete userSocketMap[userId];
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    console.log("❌ Socket disconnected:", userId);
  });
});

export { app, io, server };
