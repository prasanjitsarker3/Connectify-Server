import { Server } from "http";
import app from "./app";
import config from "./App/config";
import { Server as SocketIOServer, Socket } from "socket.io";
import { messageService } from "./Modules/Message/messageService";

declare global {
  var onlineUsers: Map<string, string>;
}

let httpServer: Server;
let io: SocketIOServer;

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.io has not been initialized!");
  }
  return io;
};

async function main() {
  try {
    httpServer = app.listen(config.PORT, () => {
      console.log("Server is running on port", config.PORT);
    });

    io = new SocketIOServer(httpServer, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type"],
        credentials: true,
      },
    });

    global.onlineUsers = new Map();

    io.on("connection", (socket: Socket) => {
      socket.on("add-user", (userId: string) => {
        if (userId) {
          global.onlineUsers.set(userId, socket.id);
          const currentOnline = Array.from(global.onlineUsers.keys());
          // console.log("Current online users:", currentOnline);
          io.emit("onlineUsers", currentOnline);
        }
      });

      socket.on("send-msg", async (data) => {
        const { from, to, message } = data;
        const updatedMessages = await messageService.getMessage(to, from);
        const recipientSocketId = global.onlineUsers.get(to);
        if (recipientSocketId) {
          socket.to(recipientSocketId).emit("msg-receive", updatedMessages);
        }
      });

      socket.on("outgoing-voice-call", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
          socket.to(sendUserSocket).emit("incoming-voice-call", {
            from: data.from,
            roomId: data.roomId,
            callType: data.callType,
          });
        }
      });

      socket.on("outgoing-video-call", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
          socket.to(sendUserSocket).emit("incoming-video-call", {
            from: data.from,
            roomId: data.roomId,
            callType: data.callType,
          });
        }
      });

      socket.on("reject-voice-call", (data) => {
        const sendUserSocket = onlineUsers.get(data.from);
        if (sendUserSocket) {
          socket.to(sendUserSocket).emit("voice-call-rejected");
        }
      });

      socket.on("reject-video-call", (data) => {
        const sendUserSocket = onlineUsers.get(data.from);
        if (sendUserSocket) {
          socket.to(sendUserSocket).emit("video-call-rejected");
        }
      });

      socket.on("accept-incoming-call", ({ id }) => {
        const sendUserSocket = onlineUsers.get(id);
        if (sendUserSocket) {
          io.to(sendUserSocket).emit("accept-call", {
            message: "Call Accepted",
          });
        }
      });

      socket.on("disconnect", () => {
        global.onlineUsers.forEach((socketId, userId) => {
          if (socketId === socket.id) {
            global.onlineUsers.delete(userId);
            const currentOnline = Array.from(global.onlineUsers.keys());
            io.emit("onlineUsers", currentOnline);
            console.log(
              "User disconnected. Updated online users:",
              currentOnline
            );
          }
        });
      });
    });
  } catch (err) {
    console.error("Error starting server:", err);
  }
}

main();

process.on("unhandledRejection", (err) => {
  console.log("😈 unhandledRejection detected, shutting down...", err);
  if (httpServer) {
    httpServer.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", () => {
  console.log("😈 uncaughtException detected, shutting down...");
  process.exit(1);
});
