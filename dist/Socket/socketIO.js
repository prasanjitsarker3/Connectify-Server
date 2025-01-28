"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUserDisconnection = exports.handleUserConnection = void 0;
// Handle user connection
function handleUserConnection(socket) {
    const userID = socket.handshake.query.userID;
    if (userID) {
        global.onlineUsers.set(userID, socket.id);
        console.log(`✅ User connected: ${userID}, Socket ID: ${socket.id}`);
    }
    socket.on("send-msg", (data) => {
        console.log("📥 Received data on server:", data);
        const { to, from, message } = data;
        if (to && from && message) {
            const sendUserSocket = global.onlineUsers.get(to);
            if (sendUserSocket) {
                socket.to(sendUserSocket).emit("msg-receive", {
                    from,
                    message,
                });
            }
            else {
                console.log(`⚠️ User ${to} is offline or not found.`);
            }
        }
        else {
            console.error(`❌ Invalid message data received:`, data);
        }
    });
}
exports.handleUserConnection = handleUserConnection;
// Handle user disconnection
function handleUserDisconnection(socket) {
    var _a;
    const userID = (_a = Array.from(global.onlineUsers.entries()).find(([, socketID]) => socketID === socket.id)) === null || _a === void 0 ? void 0 : _a[0];
    if (userID) {
        global.onlineUsers.delete(userID); // Remove user from onlineUsers
        console.log(`❌ User disconnected: ${userID}, Socket ID: ${socket.id}`);
    }
}
exports.handleUserDisconnection = handleUserDisconnection;
