"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserOnline = void 0;
const getUserOnline = (userId) => {
    return global.onlineUsers.has(userId);
};
exports.getUserOnline = getUserOnline;
