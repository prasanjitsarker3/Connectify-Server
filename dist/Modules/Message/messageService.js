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
exports.messageService = void 0;
const Prisma_1 = __importDefault(require("../../App/Common/Prisma"));
const getUserOnline_1 = require("../../Socket/getUserOnline");
const sendNewMessage = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { from, to, message } = payload;
    //From My Id
    // To Sender User Id
    const isUserOnline = (0, getUserOnline_1.getUserOnline)(to);
    if (message && from && to) {
        const newMessage = yield Prisma_1.default.messages.create({
            data: {
                message,
                senderId: from,
                recieverId: to,
                messageStatus: isUserOnline ? "delivery" : "sent",
            },
            include: {
                sender: true,
                reciever: true,
            },
        });
        return newMessage;
    }
});
const sendMessageImage = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { from, to, message } = payload;
    //From My Id
    // To Sender User Id
    const isUserOnline = (0, getUserOnline_1.getUserOnline)(to);
    if (message && from && to) {
        const newMessage = yield Prisma_1.default.messages.create({
            data: {
                message,
                senderId: from,
                recieverId: to,
                messageStatus: isUserOnline ? "delivery" : "sent",
                type: "image",
            },
            include: {
                sender: true,
                reciever: true,
            },
        });
        console.log("New Message", newMessage);
        return newMessage;
    }
});
const getMessage = (to, from) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = yield Prisma_1.default.messages.findMany({
        where: {
            OR: [
                {
                    senderId: from,
                    recieverId: to,
                },
                {
                    senderId: to,
                    recieverId: from,
                },
            ],
        },
        orderBy: {
            createdAt: "asc",
        },
    });
    const unreadMessages = [];
    messages.forEach((message) => {
        if (message.messageStatus !== "read" && message.senderId === to) {
            message.messageStatus = "read";
            unreadMessages.push(message.id);
        }
    });
    yield Prisma_1.default.messages.updateMany({
        where: {
            id: {
                in: unreadMessages,
            },
        },
        data: {
            messageStatus: "read",
        },
    });
    return messages;
});
const getInitialContactsWithMessage = (from) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield Prisma_1.default.user.findUnique({
        where: {
            id: from,
        },
        include: {
            sendMessage: {
                include: {
                    reciever: true,
                    sender: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
            recieverMessage: {
                include: {
                    reciever: true,
                    sender: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    // Merge and sort messages by `createdAt`
    const messages = [...user.sendMessage, ...user.recieverMessage];
    messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const users = new Map();
    const messageStatusChange = [];
    messages.forEach((msg) => {
        const isSender = msg.senderId === from;
        const calculatedId = isSender ? msg.recieverId : msg.senderId;
        // Collect IDs of messages that need a status change
        if (msg.messageStatus === "sent") {
            messageStatusChange.push(msg.id);
        }
        if (!users.has(calculatedId)) {
            const { id, type, message, messageStatus, createdAt, senderId, recieverId, } = msg;
            let contact = {
                messageId: id,
                type,
                message,
                messageStatus,
                createdAt,
                senderId,
                recieverId,
                totalUnreadMessage: 0,
            };
            if (isSender) {
                contact = Object.assign(Object.assign({}, contact), { id: msg.reciever.id, name: msg.reciever.name, email: msg.reciever.email, profile: msg.reciever.profile });
            }
            else {
                contact = Object.assign(Object.assign({}, contact), { id: msg.sender.id, name: msg.sender.name, email: msg.sender.email, profile: msg.sender.profile, totalUnreadMessage: messageStatus !== "read" ? 1 : 0 });
            }
            users.set(calculatedId, contact);
        }
        else if (msg.messageStatus !== "read" && !isSender) {
            // Increment unread message count for existing contact
            const existingContact = users.get(calculatedId);
            users.set(calculatedId, Object.assign(Object.assign({}, existingContact), { totalUnreadMessage: existingContact.totalUnreadMessage + 1 }));
        }
    });
    // Update message statuses in the database
    if (messageStatusChange.length) {
        yield Prisma_1.default.messages.updateMany({
            where: {
                id: {
                    in: messageStatusChange,
                },
            },
            data: {
                messageStatus: "delivery",
            },
        });
    }
    return {
        users: Array.from(users.values()),
    };
});
exports.messageService = {
    sendNewMessage,
    getMessage,
    sendMessageImage,
    getInitialContactsWithMessage,
};
