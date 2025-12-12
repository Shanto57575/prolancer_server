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
  const { jobId, freelancerId, clientId } = req.body;
  const userId = req.user.id as string;
  const role = req.user.role;

  let finalClientId = clientId;
  let finalFreelancerId = freelancerId;

  if (role === "CLIENT") {
    finalClientId = userId;
    finalFreelancerId = freelancerId;
  } else if (role === "FREELANCER") {
    finalClientId = clientId;
    finalFreelancerId = userId;
  }

  const result = await chatService.createChatRoom(
    jobId,
    finalClientId,
    finalFreelancerId
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Chat initiated successfully",
    data: result,
  });
});

const triggerTyping = catchAsync(async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const userId = req.user.id as string;

  await chatService.triggerTyping(chatId as string, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Typing event triggered",
    data: null,
  });
});

const markMessagesAsRead = catchAsync(async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const userId = req.user.id as string;

  await chatService.markMessagesAsRead(chatId as string, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Messages marked as read",
    data: null,
  });
});

export const chatController = {
  sendMessage,
  getMyChatRooms,
  getChatDetails,
  createChat,
  triggerTyping,
  markMessagesAsRead,
};
