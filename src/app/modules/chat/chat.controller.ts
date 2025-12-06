import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { chatService } from "./chat.service";

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { content, attachments } = req.body;
  const userId = req.user.id as string; // From authMiddleware

  const result = await chatService.sendMessage(
    chatId as string,
    userId,
    content,
    attachments
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Message sent successfully",
    data: result,
  });
});

const getMyChatRooms = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id as string;
  const result = await chatService.getMyChatRooms(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Chat rooms retrieved successfully",
    data: result,
  });
});

const getChatDetails = catchAsync(async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const userId = req.user.id as string;

  const result = await chatService.getChatDetails(chatId as string, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Chat details retrieved successfully",
    data: result,
  });
});

const createChat = catchAsync(async (req: Request, res: Response) => {
  const { jobId, freelancerId } = req.body;
  const userId = req.user.id as string; // This is the Client ID

  const result = await chatService.createChatRoom(jobId, userId, freelancerId);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Chat initiated successfully",
    data: result,
  });
});

export const chatController = {
  sendMessage,
  getMyChatRooms,
  getChatDetails,
  createChat,
};
