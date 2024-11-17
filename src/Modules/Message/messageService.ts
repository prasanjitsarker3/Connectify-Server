import { ITokenUser } from "../../App/Common/authType";
import prisma from "../../App/Common/Prisma";
import { getUserOnline } from "../../Socket/getUserOnline";

interface Contact {
  messageId: string;
  type: string;
  message: string;
  messageStatus: string;
  createdAt: Date;
  senderId: string;
  recieverId: string;
  id?: string; // From `sender` or `receiver`
  name?: string; // From `sender` or `receiver`
  email?: string; // From `sender` or `receiver`
  profile?: string; // From `sender` or `receiver`
  totalUnreadMessage: number; // Custom property
}

const sendNewMessage = async (payload: any) => {
  const { from, to, message } = payload;
  //From My Id
  // To Sender User Id
  const isUserOnline = getUserOnline(to);

  if (message && from && to) {
    const newMessage = await prisma.messages.create({
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
};
const sendMessageImage = async (payload: any) => {
  const { from, to, message } = payload;
  //From My Id
  // To Sender User Id
  const isUserOnline = getUserOnline(to);

  if (message && from && to) {
    const newMessage = await prisma.messages.create({
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
};

const getMessage = async (to: string, from: any) => {
  const messages = await prisma.messages.findMany({
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

  const unreadMessages: any[] = [];
  messages.forEach((message) => {
    if (message.messageStatus !== "read" && message.senderId === to) {
      message.messageStatus = "read";
      unreadMessages.push(message.id);
    }
  });

  await prisma.messages.updateMany({
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
};

const getInitialContactsWithMessage = async (from: string) => {
  const user = await prisma.user.findUnique({
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

  const users = new Map<string, Contact>();
  const messageStatusChange: string[] = [];

  messages.forEach((msg) => {
    const isSender = msg.senderId === from;
    const calculatedId = isSender ? msg.recieverId : msg.senderId;

    // Collect IDs of messages that need a status change
    if (msg.messageStatus === "sent") {
      messageStatusChange.push(msg.id);
    }

    if (!users.has(calculatedId)) {
      const {
        id,
        type,
        message,
        messageStatus,
        createdAt,
        senderId,
        recieverId,
      } = msg;

      let contact: Contact = {
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
        contact = {
          ...contact,
          id: msg.reciever.id,
          name: msg.reciever.name,
          email: msg.reciever.email,
          profile: msg.reciever.profile,
        };
      } else {
        contact = {
          ...contact,
          id: msg.sender.id,
          name: msg.sender.name,
          email: msg.sender.email,
          profile: msg.sender.profile,
          totalUnreadMessage: messageStatus !== "read" ? 1 : 0,
        };
      }

      users.set(calculatedId, contact);
    } else if (msg.messageStatus !== "read" && !isSender) {
      // Increment unread message count for existing contact
      const existingContact = users.get(calculatedId)!;
      users.set(calculatedId, {
        ...existingContact,
        totalUnreadMessage: existingContact.totalUnreadMessage + 1,
      });
    }
  });

  // Update message statuses in the database
  if (messageStatusChange.length) {
    await prisma.messages.updateMany({
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
};

export const messageService = {
  sendNewMessage,
  getMessage,
  sendMessageImage,
  getInitialContactsWithMessage,
};
