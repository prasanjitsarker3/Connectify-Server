import { ITokenUser } from "../../App/Common/authType";
import prisma from "../../App/Common/Prisma";
import { getUserOnline } from "../../Socket/getUserOnline";

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

const getUsersForSidebar = async (user: ITokenUser) => {};

export const messageService = {
  sendNewMessage,
  getMessage,
  getUsersForSidebar,
};
