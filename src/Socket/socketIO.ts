import { Socket } from "socket.io";

// Handle user connection
export function handleUserConnection(socket: Socket) {
  const userID = socket.handshake.query.userID as string;

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
      } else {
        console.log(`⚠️ User ${to} is offline or not found.`);
      }
    } else {
      console.error(`❌ Invalid message data received:`, data);
    }
  });
}

// Handle user disconnection
export function handleUserDisconnection(socket: Socket) {
  const userID = Array.from(global.onlineUsers.entries()).find(
    ([, socketID]) => socketID === socket.id
  )?.[0];

  if (userID) {
    global.onlineUsers.delete(userID); // Remove user from onlineUsers
    console.log(`❌ User disconnected: ${userID}, Socket ID: ${socket.id}`);
  }
}
