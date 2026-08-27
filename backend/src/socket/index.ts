import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { verifyToken } from "../utils/jwt";

let io: SocketServer;

export function initializeSocket(server: HttpServer) {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const payload = verifyToken(token);
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.data.userId} connected`);

    socket.on("join-ride", (rideId: number) => {
      socket.join(`ride-${rideId}`);
    });

    socket.on("leave-ride", (rideId: number) => {
      socket.leave(`ride-${rideId}`);
    });

    socket.on("send-message", (data: { rideId: number; message: string }) => {
      io.to(`ride-${data.rideId}`).emit("new-message", {
        userId: socket.data.userId,
        message: data.message,
        timestamp: new Date(),
      });
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.data.userId} disconnected`);
    });
  });

  return io;
}

export function getIO() {
  return io;
}