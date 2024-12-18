import { Request, Response } from "express";
import catchAsync from "../../Utilities/catchAsync";
import { messageService } from "./messageService";
import sendResponse from "../../Utilities/sendResponse";
import httpStatus from "http-status";

const sendMessage = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await messageService.sendNewMessage(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Message Send Successfully",
      data: result,
    });
  }
);
const sendMessageWithImage = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await messageService.sendMessageImage(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Message Send Successfully",
      data: result,
    });
  }
);

const getMessage = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const { id } = req.params;
    const from = req.user?.id;
    const result = await messageService.getMessage(id, from);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Message Successfully",
      data: result,
    });
  }
);

const getInitialContactsWithMessage = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const { fromId } = req.params;
    const result = await messageService.getInitialContactsWithMessage(fromId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile Successfully",
      data: result,
    });
  }
);

export const messageController = {
  sendMessage,
  getMessage,
  sendMessageWithImage,
  getInitialContactsWithMessage,
};
