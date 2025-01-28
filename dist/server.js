"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = void 0;
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./App/config"));
const socket_io_1 = require("socket.io");
const messageService_1 = require("./Modules/Message/messageService");
let httpServer;
let io;
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialized!");
    }
    return io;
};
exports.getIO = getIO;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            httpServer = app_1.default.listen(config_1.default.PORT, () => {
                console.log("Server is running on port", config_1.default.PORT);
            });
            io = new socket_io_1.Server(httpServer, {
                cors: {
                    origin: "http://localhost:3000",
                    methods: ["GET", "POST", "PATCH", "DELETE"],
                    allowedHeaders: ["Content-Type"],
                    credentials: true,
                },
            });
            global.onlineUsers = new Map();
            io.on("connection", (socket) => {
                socket.on("add-user", (userId) => {
                    if (userId) {
                        global.onlineUsers.set(userId, socket.id);
                        const currentOnline = Array.from(global.onlineUsers.keys());
                        // console.log("Current online users:", currentOnline);
                        io.emit("onlineUsers", currentOnline);
                    }
                });
                socket.on("send-msg", (data) => __awaiter(this, void 0, void 0, function* () {
                    const { from, to, message } = data;
                    const updatedMessages = yield messageService_1.messageService.getMessage(to, from);
                    const recipientSocketId = global.onlineUsers.get(to);
                    if (recipientSocketId) {
                        socket.to(recipientSocketId).emit("msg-receive", updatedMessages);
                    }
                }));
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
                            console.log("User disconnected. Updated online users:", currentOnline);
                        }
                    });
                });
            });
        }
        catch (err) {
            console.error("Error starting server:", err);
        }
    });
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
